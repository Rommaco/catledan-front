import { getApiBaseUrl } from '@/lib/api/config'

interface ApiBody<T = unknown> {
  success?: boolean
  data?: T
  error?: { message?: string }
}

/** POST /assistant/chat - Dan (especialista veterinario y agropecuario) */
export async function sendAssistantMessage(message: string): Promise<string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  const url = `${getApiBaseUrl()}/assistant/chat`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ message }),
  })
  const json = (await res.json().catch(() => ({}))) as ApiBody<{ answer?: string; output?: string }>
  if (!res.ok) {
    const err = json?.error?.message ?? (json as { message?: string })?.message ?? `Error ${res.status}`
    throw new Error(err)
  }
  if (json.success === false) {
    throw new Error(json?.error?.message ?? 'Error en el asistente')
  }
  const data = json.data as { answer?: string; output?: string } | undefined
  return data?.answer ?? data?.output ?? 'No pude generar una respuesta. Intenta de nuevo.'
}
