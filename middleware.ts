import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    // Protection des routes API utilisateur
    if (request.nextUrl.pathname.startsWith('/api/user/')) {
      if (!token) {
        return NextResponse.json(
          { error: 'Non autorisé' },
          { status: 401 }
        );
      }
      return NextResponse.next();
    }

    // Protection des routes admin
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!token || token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    // Protection des routes utilisateur
    if (request.nextUrl.pathname.startsWith('/profil')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    // Protection des routes checkout
    if (request.nextUrl.pathname.startsWith('/checkout')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Erreur middleware:', error);
    // En cas d'erreur, laisser passer la requête pour éviter de bloquer l'utilisateur
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/profil/:path*',
    '/checkout/:path*',
    '/admin/:path*',
    '/api/user/:path*'
  ]
};