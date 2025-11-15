export const generateCookieOptions = (secure = false) => ({
  httpOnly: true,
  secure,
  sameSite: 'strict' as const,
  path: '/',
});

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
