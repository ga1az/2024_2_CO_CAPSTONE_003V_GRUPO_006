import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const storeId = request.nextUrl.pathname.split('/').pop()

  if (storeId && !/^\d+$/.test(storeId)) {
    return NextResponse.redirect(new URL('/404', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:storeId'
}
