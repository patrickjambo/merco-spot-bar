import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-key-for-merico-spot-12345'
);

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  
  // Public routes that don't need authentication
  if (
    request.nextUrl.pathname === '/' || 
    request.nextUrl.pathname.startsWith('/menu') ||
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/api/seed') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // No active session cookie - redirect to login
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify token
    const { payload } = await jwtVerify(sessionCookie.value, SECRET_KEY, {
      algorithms: ['HS256'],
    });

    const userRole = payload.role as string;

    // Role-based access control
    if (request.nextUrl.pathname.startsWith('/admin') && userRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/manager/pos', request.url));
    }

    if (request.nextUrl.pathname.startsWith('/manager') && userRole !== 'manager' && userRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid or expired token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
