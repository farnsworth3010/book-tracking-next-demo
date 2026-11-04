// Carries the status, so callers can tell "not found" from "server is down"
export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

export async function request(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...init })

  if (!res.ok) throw new HttpError(res.status, `${init?.method ?? 'GET'} ${url} failed: ${res.status}`)

  return res.json()
}
