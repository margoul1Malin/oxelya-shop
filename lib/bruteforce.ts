import { NextRequest, NextResponse } from 'next/server'
import prisma from './prisma'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

interface UserFingerprint {
  ip: string
  userAgent: string
  headers: Record<string, string>
  browser?: string
  os?: string
  device?: string
  language?: string
  timezone?: string
  screenSize?: string
  colorDepth?: number
  pixelRatio?: number
  canvasFingerprint?: string
  webglFingerprint?: string
  fingerprint: string
}

interface BruteforceResult {
  blocked: boolean
  remainingTime?: number
  attempts: number
  fingerprint: string
}

export async function checkBruteforceAdvanced(request: NextRequest): Promise<BruteforceResult> {
  const fingerprint = await generateFingerprint(request)
  const now = new Date()
  
  // Rechercher les tentatives existantes
  const existingAttempt = await prisma.bruteforceAttempt.findFirst({
    where: {
      OR: [
        { fingerprint: fingerprint.fingerprint },
        { ip: fingerprint.ip }
      ]
    },
    orderBy: { lastAttempt: 'desc' }
  })
  
  if (existingAttempt && existingAttempt.isBlocked && existingAttempt.blockedUntil && existingAttempt.blockedUntil > now) {
    const remainingTime = Math.ceil((existingAttempt.blockedUntil.getTime() - now.getTime()) / 1000)
    return {
      blocked: true,
      remainingTime,
      attempts: existingAttempt.attempts,
      fingerprint: existingAttempt.fingerprint
    }
  }
  
  // Si le blocage est expiré, réinitialiser
  if (existingAttempt && existingAttempt.blockedUntil && existingAttempt.blockedUntil <= now) {
    await prisma.bruteforceAttempt.update({
      where: { id: existingAttempt.id },
      data: {
        isBlocked: false,
        blockedUntil: null,
        attempts: 0
      }
    })
  }
  
  return {
    blocked: false,
    attempts: existingAttempt?.attempts || 0,
    fingerprint: fingerprint.fingerprint
  }
}

export async function recordFailedAttemptAdvanced(request: NextRequest): Promise<BruteforceResult> {
  const fingerprint = await generateFingerprint(request)
  const now = new Date()
  const sessionId = request.cookies.get('session_id')?.value
  
  // Rechercher ou créer une tentative
  let attempt = await prisma.bruteforceAttempt.findFirst({
    where: {
      OR: [
        { fingerprint: fingerprint.fingerprint },
        { ip: fingerprint.ip }
      ]
    }
  })
  
  if (!attempt) {
    attempt = await prisma.bruteforceAttempt.create({
      data: {
        ip: fingerprint.ip,
        userAgent: fingerprint.userAgent,
        fingerprint: fingerprint.fingerprint,
        sessionId,
        attempts: 0,
        headers: fingerprint.headers,
        browser: fingerprint.browser,
        os: fingerprint.os,
        device: fingerprint.device,
        language: fingerprint.language,
        timezone: fingerprint.timezone,
        screenSize: fingerprint.screenSize,
        colorDepth: fingerprint.colorDepth,
        pixelRatio: fingerprint.pixelRatio,
        canvasFingerprint: fingerprint.canvasFingerprint,
        webglFingerprint: fingerprint.webglFingerprint
      }
    })
  }
  
  // Incrémenter les tentatives
  const updatedAttempt = await prisma.bruteforceAttempt.update({
    where: { id: attempt.id },
    data: {
      attempts: attempt.attempts + 1,
      lastAttempt: now,
      headers: fingerprint.headers, // Mettre à jour les headers
      userAgent: fingerprint.userAgent
    }
  })
  
  // Bloquer après 5 tentatives
  if (updatedAttempt.attempts >= 5) {
    const blockedUntil = new Date(now.getTime() + 5 * 60 * 1000) // 5 minutes
    
    await prisma.bruteforceAttempt.update({
      where: { id: attempt.id },
      data: {
        isBlocked: true,
        blockedUntil
      }
    })
    
    // Envoyer l'alerte
    await sendBruteforceAlertAdvanced(updatedAttempt)
    
    return {
      blocked: true,
      remainingTime: 300,
      attempts: updatedAttempt.attempts,
      fingerprint: updatedAttempt.fingerprint
    }
  }
  
  return {
    blocked: false,
    attempts: updatedAttempt.attempts,
    fingerprint: updatedAttempt.fingerprint
  }
}

export async function recordSuccessfulAttemptAdvanced(request: NextRequest): Promise<void> {
  const fingerprint = await generateFingerprint(request)
  
  // Réinitialiser toutes les tentatives pour cette fingerprint/IP
  await prisma.bruteforceAttempt.updateMany({
    where: {
      OR: [
        { fingerprint: fingerprint.fingerprint },
        { ip: fingerprint.ip }
      ]
    },
    data: {
      attempts: 0,
      isBlocked: false,
      blockedUntil: null
    }
  })
}

// Fonction pour vérifier le statut anti-bruteforce par fingerprint
export async function checkBruteforceStatus(fingerprint: string) {
  const now = new Date()
  
  // Rechercher les tentatives pour ce fingerprint
  const attempts = await prisma.bruteforceAttempt.findMany({
    where: {
      fingerprint: fingerprint
    },
    orderBy: { lastAttempt: 'desc' }
  })
  
  if (attempts.length === 0) {
    return {
      isBlocked: false,
      blockTimeLeft: 0,
      attemptsLeft: 5,
      lastAttempt: null
    }
  }
  
  const latestAttempt = attempts[0]
  
  // Vérifier si bloqué
  if (latestAttempt.isBlocked && latestAttempt.blockedUntil && latestAttempt.blockedUntil > now) {
    const blockTimeLeft = Math.ceil((latestAttempt.blockedUntil.getTime() - now.getTime()) / 1000)
    return {
      isBlocked: true,
      blockTimeLeft,
      attemptsLeft: 0,
      lastAttempt: latestAttempt.lastAttempt
    }
  }
  
  // Si le blocage est expiré, réinitialiser
  if (latestAttempt.isBlocked && latestAttempt.blockedUntil && latestAttempt.blockedUntil <= now) {
    await prisma.bruteforceAttempt.update({
      where: { id: latestAttempt.id },
      data: {
        isBlocked: false,
        blockedUntil: null,
        attempts: 0
      }
    })
    
    return {
      isBlocked: false,
      blockTimeLeft: 0,
      attemptsLeft: 5,
      lastAttempt: null
    }
  }
  
  // Calculer les tentatives restantes
  const attemptsLeft = Math.max(0, 5 - latestAttempt.attempts)
  
  return {
    isBlocked: false,
    blockTimeLeft: 0,
    attemptsLeft,
    lastAttempt: latestAttempt.lastAttempt
  }
}

export function setSessionCookie(response: NextResponse): NextResponse {
  const sessionId = generateSessionId()
  response.cookies.set('session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 7 jours
  })
  return response
}

export async function generateFingerprint(request: NextRequest): Promise<UserFingerprint> {
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // Collecter tous les headers
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })
  
  // Analyser le User-Agent
  const { browser, os, device } = parseUserAgent(userAgent)
  
  // Créer un fingerprint unique
  const fingerprintData = {
    ip,
    userAgent,
    browser,
    os,
    device,
    acceptLanguage: headers['accept-language'],
    acceptEncoding: headers['accept-encoding'],
    secChUa: headers['sec-ch-ua'],
    secChUaPlatform: headers['sec-ch-ua-platform'],
    secChUaMobile: headers['sec-ch-ua-mobile']
  }
  
  const fingerprint = crypto
    .createHash('sha256')
    .update(JSON.stringify(fingerprintData))
    .digest('hex')
  
  return {
    ip,
    userAgent,
    headers,
    browser,
    os,
    device,
    language: headers['accept-language'],
    fingerprint
  }
}

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

function parseUserAgent(userAgent: string): { browser?: string; os?: string; device?: string } {
  const ua = userAgent.toLowerCase()
  
  // Détecter le navigateur
  let browser: string | undefined
  if (ua.includes('chrome')) browser = 'Chrome'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('safari')) browser = 'Safari'
  else if (ua.includes('edge')) browser = 'Edge'
  else if (ua.includes('opera')) browser = 'Opera'
  
  // Détecter l'OS
  let os: string | undefined
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac')) os = 'macOS'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('ios')) os = 'iOS'
  
  // Détecter le device
  let device: string | undefined
  if (ua.includes('mobile')) device = 'Mobile'
  else if (ua.includes('tablet')) device = 'Tablet'
  else device = 'Desktop'
  
  return { browser, os, device }
}

function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex')
}

async function sendBruteforceAlertAdvanced(attempt: any): Promise<void> {
  try {
    const subject = '🚨 Alerte Sécurité - Tentative de Bruteforce Détectée'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; color: #ff6b6b;">🚨 ALERTE SÉCURITÉ</h1>
          <p style="margin: 10px 0; font-size: 18px; opacity: 0.9;">Tentative de Bruteforce Détectée</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 15px 0; color: #ff6b6b;">Détails de l'Incident</h2>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #ffd93d;">📍 Adresse IP :</strong>
            <span style="margin-left: 10px; font-family: monospace; background: rgba(0, 0, 0, 0.3); padding: 5px 10px; border-radius: 4px;">${attempt.ip}</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #ffd93d;">🔍 Fingerprint :</strong>
            <span style="margin-left: 10px; font-family: monospace; background: rgba(0, 0, 0, 0.3); padding: 5px 10px; border-radius: 4px; font-size: 12px;">${attempt.fingerprint.substring(0, 16)}...</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #ffd93d;">🌐 Navigateur :</strong>
            <span style="margin-left: 10px;">${attempt.browser || 'Inconnu'}</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #ffd93d;">💻 Système :</strong>
            <span style="margin-left: 10px;">${attempt.os || 'Inconnu'}</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #ffd93d;">📱 Appareil :</strong>
            <span style="margin-left: 10px;">${attempt.device || 'Inconnu'}</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #ffd93d;">🔢 Nombre de Tentatives :</strong>
            <span style="margin-left: 10px; background: #ff6b6b; padding: 5px 10px; border-radius: 4px; font-weight: bold;">${attempt.attempts}</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #ffd93d;">⏰ Heure de Détection :</strong>
            <span style="margin-left: 10px;">${new Date(attempt.lastAttempt).toLocaleString('fr-FR')}</span>
          </div>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #6bcf7f;">🛡 Actions Automatiques</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">✅ Fingerprint et IP bloqués pendant 5 minutes</li>
            <li style="margin-bottom: 8px;">✅ Tentatives de connexion suspendues</li>
            <li style="margin-bottom: 8px;">✅ Profil utilisateur enregistré en base</li>
            <li style="margin-bottom: 8px;">✅ Notification d'alerte envoyée</li>
          </ul>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 8px;">
          <h3 style="margin: 0 0 15px 0; color: #ffd93d;">📋 Recommandations</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">🔍 Surveiller cette fingerprint pour d'autres activités suspectes</li>
            <li style="margin-bottom: 8px;">📊 Analyser les patterns de tentatives</li>
            <li style="margin-bottom: 8px;">🛡 Considérer l'ajout de CAPTCHA ou 2FA</li>
            <li style="margin-bottom: 8px;">🔒 Renforcer la sécurité avec des règles de pare-feu</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
          <p style="margin: 0; opacity: 0.8; font-size: 14px;">
            Cet email a été généré automatiquement par le système de sécurité avancé de Margoul1 Store.
          </p>
        </div>
      </div>
    `
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    })
    
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || 'admin@margoul1.dev',
      subject,
      html
    })
    
    console.log(`🚨 Alerte bruteforce avancée envoyée pour IP: ${attempt.ip}, Fingerprint: ${attempt.fingerprint}, Tentatives: ${attempt.attempts}`)
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'alerte bruteforce avancée:', error)
  }
} 