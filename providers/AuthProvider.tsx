'use client';

import { SessionProvider } from 'next-auth/react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={15 * 60} // Rafraîchir toutes les 15 minutes au lieu de 5
      refetchOnWindowFocus={false} // Désactiver le rafraîchissement au focus
      refetchWhenOffline={false} // Pas de rafraîchissement hors ligne
    >
      {children}
    </SessionProvider>
  );
} 