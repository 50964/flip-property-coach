const COOLDOWN_MS = 60 * 1000
const STORAGE_PREFIX = 'flip_magic_link_requested_at:'

function storageKey(email: string) {
  return `${STORAGE_PREFIX}${email.trim().toLowerCase()}`
}

export function getMagicLinkCooldownRemaining(email: string): number {
  if (typeof window === 'undefined') return 0

  const raw = window.localStorage.getItem(storageKey(email))
  if (!raw) return 0

  const requestedAt = Number(raw)
  if (!Number.isFinite(requestedAt)) return 0

  return Math.max(0, COOLDOWN_MS - (Date.now() - requestedAt))
}

export function markMagicLinkRequested(email: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(storageKey(email), String(Date.now()))
}

export function formatCooldownMessage(msRemaining: number) {
  const seconds = Math.max(1, Math.ceil(msRemaining / 1000))
  return `Too many requests. Please wait ${seconds} seconds before requesting another magic link.`
}
