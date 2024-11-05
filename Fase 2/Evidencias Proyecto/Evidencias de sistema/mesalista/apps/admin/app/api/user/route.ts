import { NextResponse } from 'next/server'
import { getUserFromCookie } from '@/actions/user'

export async function GET() {
  try {
    const user = await getUserFromCookie()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error in user API route:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
