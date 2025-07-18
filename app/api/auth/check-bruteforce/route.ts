import { NextRequest, NextResponse } from 'next/server';
import { checkBruteforceStatus, generateFingerprint } from '../../../../lib/bruteforce';

export async function POST(request: NextRequest) {
  try {
    // Générer le fingerprint automatiquement à partir de la requête
    const fingerprint = await generateFingerprint(request);
    
    // Utiliser le fingerprint au lieu de l'email
    const status = await checkBruteforceStatus(fingerprint.fingerprint);

    return NextResponse.json({
      isBlocked: status.isBlocked,
      blockTimeLeft: status.blockTimeLeft,
      attemptsLeft: status.attemptsLeft,
      lastAttempt: status.lastAttempt
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du statut anti-bruteforce:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 