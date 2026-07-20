/** Encrypt Gmail tokens at rest using a key derived from JWT_SECRET. */

async function deriveKey(secret: string): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('renttracker-gmail-token-v1'),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let binary = ''
  for (const b of view) {
    binary += String.fromCharCode(b)
  }
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function encryptSecret(secret: string, plaintext: string): Promise<string> {
  const key = await deriveKey(secret)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext),
  )
  return `${toBase64(iv)}.${toBase64(cipher)}`
}

export async function decryptSecret(secret: string, payload: string): Promise<string> {
  const [ivPart, cipherPart] = payload.split('.')
  if (!ivPart || !cipherPart) {
    throw new Error('Invalid encrypted secret payload')
  }
  const key = await deriveKey(secret)
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(ivPart) },
    key,
    fromBase64(cipherPart),
  )
  return new TextDecoder().decode(plain)
}
