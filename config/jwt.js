import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * JWT 토큰 생성
 */
export const createToken = (userId, username) => {
  return jwt.sign(
    { userId, username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
};

/**
 * JWT 토큰 검증
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * httpOnly Cookie에 JWT 토큰 세팅
 *   프로덕션에서는 SameSite=None; Secure 필수
 */
export const setTokenCookie = (res, token) => {
  res.cookie('accessToken', token, {
    httpOnly: true,                          // JS에서 접근 불가 (XSS 방지)
    secure: IS_PRODUCTION,                   // HTTPS에서만 전송
    sameSite: IS_PRODUCTION ? 'None' : 'Lax', // 크로스 오리진 허용
    maxAge: 24 * 60 * 60 * 1000,            // 24시간 (ms)
    path: '/',
  });
};

/**
 * Cookie 삭제 (로그아웃)
 */
export const clearTokenCookie = (res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? 'None' : 'Lax',
    path: '/',
  });
};

/**
 * 토큰에서 사용자 ID 추출
 */
export const getUserIdFromToken = (token) => {
  const decoded = verifyToken(token);
  return decoded ? decoded.userId : null;
};

/**
 * 토큰에서 username 추출
 */
export const getUsernameFromToken = (token) => {
  const decoded = verifyToken(token);
  return decoded ? decoded.username : null;
};

export const getExpirationTime = () => JWT_EXPIRATION;

export default {
  createToken,
  verifyToken,
  setTokenCookie,
  clearTokenCookie,
  getUserIdFromToken,
  getUsernameFromToken,
  getExpirationTime,
};