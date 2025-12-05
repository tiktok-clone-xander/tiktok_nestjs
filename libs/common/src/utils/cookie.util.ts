export const generateCookieOptions = (secure = false) => ({
  httpOnly: true,
  secure,
  sameSite: 'lax' as const, // Changed from 'strict' to 'lax' to allow cookies to be sent with requests
  path: '/',
});

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
