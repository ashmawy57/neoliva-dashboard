import { keepAlive } from '@/lib/keep-alive'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await keepAlive()
  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() })
}
