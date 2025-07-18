import { NextRequest, NextResponse } from 'next/server';
import { checkBruteforceStatus, generateFingerprint } from '../../../../lib/bruteforce';
import prisma from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { success } = await request.json();
    
    // Générer le fingerprint automatiquement à partir de la requête
    const fingerprint = await generateFingerprint(request);

    if (success) {
      // Réinitialiser les tentatives en cas de succès
      await prisma.bruteforceAttempt.updateMany({
        where: {
          OR: [
            { ip: fingerprint.ip },
            { fingerprint: fingerprint.fingerprint }
          ]
        },
        data: {
          attempts: 0,
          isBlocked: false,
          blockedUntil: null
        }
      });
    } else {
      // Enregistrer une tentative échouée
      const now = new Date();
      
      // Rechercher ou créer une tentative
      let attempt = await prisma.bruteforceAttempt.findFirst({
        where: {
          OR: [
            { ip: fingerprint.ip },
            { fingerprint: fingerprint.fingerprint }
          ]
        }
      });

      if (!attempt) {
        attempt = await prisma.bruteforceAttempt.create({
          data: {
            ip: fingerprint.ip,
            userAgent: fingerprint.userAgent,
            fingerprint: fingerprint.fingerprint,
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
            webglFingerprint: fingerprint.webglFingerprint,
            lastAttempt: now
          }
        });
      }

      // Incrémenter les tentatives
      const updatedAttempt = await prisma.bruteforceAttempt.update({
        where: { id: attempt.id },
        data: {
          attempts: attempt.attempts + 1,
          lastAttempt: now,
          headers: fingerprint.headers,
          userAgent: fingerprint.userAgent
        }
      });

      // Bloquer après 5 tentatives
      if (updatedAttempt.attempts >= 5) {
        const blockedUntil = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
        
        await prisma.bruteforceAttempt.update({
          where: { id: attempt.id },
          data: {
            isBlocked: true,
            blockedUntil
          }
        });
      }
    }

    // Retourner le nouveau statut
    const status = await checkBruteforceStatus(fingerprint.fingerprint);

    return NextResponse.json({
      isBlocked: status.isBlocked,
      blockTimeLeft: status.blockTimeLeft,
      attemptsLeft: status.attemptsLeft,
      lastAttempt: status.lastAttempt
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la tentative:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 