// Verifica que la petición venga de un usuario con sesión válida de Supabase.
// Los archivos bajo api/_lib no se exponen como endpoints en Vercel.
// Valida el JWT contra Supabase Auth (/auth/v1/user), así un token
// vencido, revocado o falso es rechazado.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

// Devuelve el usuario, o responde 401/503 y devuelve null.
export async function requireUser(req, res) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    res.status(503).json({ error: 'no_auth_config', message: 'Falta configurar Supabase en el servidor.' })
    return null
  }

  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) {
    res.status(401).json({ error: 'unauthorized', message: 'Debes iniciar sesión.' })
    return null
  }

  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, authorization: `Bearer ${token}` },
    })
    if (!r.ok) {
      res.status(401).json({ error: 'unauthorized', message: 'Tu sesión expiró. Vuelve a iniciar sesión.' })
      return null
    }
    const user = await r.json()
    if (!user?.id) {
      res.status(401).json({ error: 'unauthorized', message: 'Sesión inválida.' })
      return null
    }
    return user
  } catch {
    res.status(503).json({ error: 'auth_unavailable', message: 'No se pudo verificar la sesión.' })
    return null
  }
}
