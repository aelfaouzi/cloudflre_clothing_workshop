export function generateId(): string {
  return crypto.randomUUID()
}

export function generateJobNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `JOB-${year}${month}${day}-${rand}`
}

export function now(): string {
  return new Date().toISOString()
}
