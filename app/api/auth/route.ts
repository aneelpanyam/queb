import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const SESSION_DURATION = 15 * 60 // 15 minutes in seconds

function getSecret() {
  const secret = process.env.SESSION_SECRET || 'question-book-default-secret-change-me'
  return new TextEncoder().encode(secret)
}

async function createSessionToken() {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret())
}

// POST = login
export async function POST(req: Request) {
  const { accessCode } = await req.json()
  const expectedCode = process.env.ACCESS_CODE

  if (!expectedCode) {
    return Response.json(
      { error: 'ACCESS_CODE environment variable is not configured' },
      { status: 500 }
    )
  }

  if (accessCode !== expectedCode) {
    return Response.json({ error: 'Invalid access code' }, { status: 401 })
  }

  const token = await createSessionToken()
  const cookieStore = await cookies()
  cookieStore.set('qb-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION,
  })

  return Response.json({ success: true })
}

// GET = check session / refresh rolling window
export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('qb-session')?.value

  if (!token) {
    return Response.json({ authenticated: false }, { status: 401 })
  }

  try {
    await jwtVerify(token, getSecret())

    // Rolling window: issue a fresh token on every check
    const newToken = await createSessionToken()
    cookieStore.set('qb-session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION,
    })

    return Response.json({ authenticated: true })
  } catch {
    cookieStore.delete('qb-session')
    return Response.json({ authenticated: false }, { status: 401 })
  }
}

// DELETE = logout
export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('qb-session')
  return Response.json({ success: true })
}
