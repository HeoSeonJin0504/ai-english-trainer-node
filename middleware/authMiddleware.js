import { verifyToken } from '../config/jwt.js';
import { UnauthorizedException } from '../utils/errors.js';
import ApiResponse from '../utils/ApiResponse.js';

// JWT 인증 미들웨어
export const authMiddleware = (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(ApiResponse.error('로그인이 필요합니다.'));
    }

    const token = authHeader.substring(7); // 'Bearer ' 제거
    
    // 토큰 검증
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json(ApiResponse.error('유효하지 않은 토큰입니다.'));
    }

    // 요청 객체에 사용자 정보 추가
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
