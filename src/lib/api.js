import { supabase } from './supabase'

// POST a una función de /api adjuntando el token de sesión de Supabase,
// que las funciones exigen para no exponer las API keys de IA.
export async function postApi(path, body) {
  const { data: { session } } = await supabase.auth.getSession()
  return fetch(path, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(session && { authorization: `Bearer ${session.access_token}` }),
    },
    body: JSON.stringify(body),
  })
}
