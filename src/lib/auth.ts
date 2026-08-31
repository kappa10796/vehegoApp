import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const secretKey = process.env.JWT_SECRET || 'himalayan-ride-super-secret-key-2026'
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key)
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  })
  return payload
}

export async function setSession(user: { id: string; email: string; role: string; name: string; driverStatus?: string | null }) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const session = await encrypt({ user, expires })
  const cookieStore = await cookies()
  cookieStore.set('session', session, { expires, httpOnly: true, path: '/' })
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  if (!session) return null
  try {
    return await decrypt(session)
  } catch (error) {
    return null
  }
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function verifyAuth(req: NextRequest) {
  const session = req.cookies.get('session')?.value
  if (!session) return null
  try {
    return await decrypt(session)
  } catch (error) {
    return null
  }
}
