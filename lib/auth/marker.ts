const encoder = new TextEncoder();

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function signature(payload: string) {
  const secret = process.env.TOKEN_ENCRYPTION_KEY;
  if (!secret) throw new Error('TOKEN_ENCRYPTION_KEY is not configured');
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(payload))));
}

export type AuthMarkerPayload = { expiresAt: number; email?: string; uid: string };

export async function createAuthMarker(data: AuthMarkerPayload) {
  const payload = bytesToBase64Url(encoder.encode(JSON.stringify(data)));
  return `${payload}.${await signature(payload)}`;
}

export async function verifyAuthMarker(marker?: string) {
  if (!marker) return null;
  const [payload, supplied, extra] = marker.split('.');
  if (!payload || !supplied || extra) return null;
  const expected = await signature(payload);
  if (expected.length !== supplied.length) return null;
  let difference = 0;
  for (let index = 0; index < expected.length; index++) difference |= expected.charCodeAt(index) ^ supplied.charCodeAt(index);
  if (difference !== 0) return null;
  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes)) as AuthMarkerPayload;
    return data.expiresAt > Date.now() && data.uid ? data : null;
  } catch {
    return null;
  }
}
