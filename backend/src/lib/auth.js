export function getTokenFromRequest(request) {
  const cookieToken = request.cookies?.get?.('inspectai_session')?.value;
  const authHeader = request.headers?.get?.('authorization');
  return cookieToken || (authHeader ? authHeader.split(' ')[1] : null);
}

export function getUsuarioAutenticado(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    return JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}
