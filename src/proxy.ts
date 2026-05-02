import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy (Middleware) สำหรับจัดการ Route Protection
 * บังคับให้ผู้ใช้ต้อง Login ก่อนเข้าถึงหน้า Dashboard และส่วนอื่นๆ
 * ยกเว้นหน้า Login และ Record of Ragnarok (ROR)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. ตรวจสอบว่าเป็นเส้นทางสาธารณะหรือไม่
  // หมายเหตุ: /register ถูกกำหนดให้เป็น Private ตามความต้องการล่าสุด
  const isPublicRoute = 
    pathname === '/login' || 
    pathname.startsWith('/record-of-ragnarok');

  // 2. ถ้าเป็นเส้นทางสาธารณะ ให้ผ่านไปได้เลย
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 3. ตรวจสอบ Token ใน Cookie
  const token = request.cookies.get('auth_token')?.value;

  // 4. ถ้าไม่มี Token และไม่ใช่เส้นทางสาธารณะ ให้ Redirect ไปหน้า Login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    // แนบ callbackUrl เพื่อให้กลับมาหน้าเดิมหลัง Login ได้
    loginUrl.searchParams.set('callbackUrl', pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * กำหนด matcher เพื่อให้ Proxy ทำงานเฉพาะในเส้นทางที่ต้องการ
 * ยกเว้น static files และ api internal ของ Next.js
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api (internal API routes)
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. favicon.ico, images, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
