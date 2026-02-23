import jwt from 'jsonwebtoken';
import config from './env.js';

const JWT_SECRET = config.JWT_SECRET;
const JWT_EXPIRATION = config.JWT_EXPIRATION || '24h';
const IS_PRODUCTION = config.NODE_ENV === 'production';

// 프로덕션에서 JWT_SECRET 없으면 서버 시작 중단
if (!JWT_SECRET) {
  if (IS_PRODUCTION) {
    console.error('❌ FATAL: JWT_SECRET 환경변수가 설정되지 않았습니다. 서버를 종료합니다.');
    process.exit(1);
  } else {
    console.warn('⚠️  JWT_SECRET이 없습니다. 개발용 임시 키를 사용합니다. 프로덕션에서는 반드시 설정하세요!');
  }
}

const EFFECTIVE_SECRET = JWT_SECRET || 'dev-only-insecure-secret-do-not-use-in-production';

/**
 * JWT 토큰 생성
 */
export const createToken = (userId, username) => {
  return jwt.sign(
    { userId, username },
    EFFECTIVE_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
};

/**
 * JWT 토큰 검증
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, EFFECTIVE_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * httpOnly Cookie에 JWT 토큰 세팅
 * 프로덕션에서는 SameSite=None + Secure 필수
 */
export const setTokenCookie = (res, token) => {
  res.cookie('accessToken', token, {
    httpOnly: true,                              // JS에서 접근 불가 (XSS 방지)
    secure: IS_PRODUCTION,                       // HTTPS에서만 전송
    sameSite: IS_PRODUCTION ? 'None' : 'Lax',   // 크로스 오리진 허용 (Vercel ↔ Render)
    maxAge: 24 * 60 * 60 * 1000,                // 24시간 (ms)
    path: '/',
  });
};

/**
 * Cookie 삭제 (로그아웃)
 * 로그인 시와 동일한 옵션을 사용해야 정상 삭제됨
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