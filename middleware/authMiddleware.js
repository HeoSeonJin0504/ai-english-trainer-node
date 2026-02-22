import { verifyToken } from '../config/jwt.js';
import { UnauthorizedException } from '../utils/errors.js';
import ApiResponse from '../utils/ApiResponse.js';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * JWT 인증 미들웨어
 *
 * 토큰 우선순위: httpOnly Cookie > Authorization Bearer 헤더
 *
 * Bearer 헤더는 개발환경(Postman 테스트)에서만 허용
 * 프로덕션에서는 httpOnly Cookie만 허용
 */
export const authMiddleware = (req, res, next) => {
  try {
    let token = null;

    // 1순위: httpOnly Cookie (프로덕션/개발 모두 허용)
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // 2순위: Authorization Bearer 헤더 (개발환경에서만 허용)
    if (!token && !IS_PRODUCTION) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json(ApiResponse.error('로그인이 필요합니다.'));
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json(ApiResponse.error('유효하지 않은 토큰입니다.'));
    }

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
    };

    next();
  } catch (error) {
    return res.status(401).json(ApiResponse.error('인증에 실패했습니다.'));
  }
};

// 현재 사용자 ID 가져오기
export const getCurrentUserId = (req) => {
  if (!req.user || !req.user.userId) {
    throw new UnauthorizedException('로그인이 필요합니다.');
  }
  return req.user.userId;
};

// 현재 사용자명 가져오기
export const getCurrentUsername = (req) => {
  if (!req.user || !req.user.username) {
    throw new UnauthorizedException('로그인이 필요합니다.');
  }
  return req.user.username;
};

export default authMiddleware;