import logger from '../utils/logger.js';
import ApiResponse from '../utils/ApiResponse.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${req.method} ${req.path} - ${err.message}`);
  } else {
    logger.warn(`[${statusCode}] ${req.method} ${req.path} - ${err.message}`);
  }

  // JWT 오류
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(ApiResponse.error('유효하지 않은 토큰입니다.'));
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(ApiResponse.error('토큰이 만료되었습니다.'));
  }

  // 유효성 오류
  if (err.name === 'ValidationError') {
    return res.status(400).json(ApiResponse.error(err.message));
  }

  // 일반 오류
  res.status(statusCode).json(
    ApiResponse.error(isProduction ? '서버 내부 오류가 발생했습니다.' : err.message)
  );
};