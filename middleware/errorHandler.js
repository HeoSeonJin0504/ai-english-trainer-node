import ApiResponse from '../utils/ApiResponse.js';

export const errorHandler = (err, req, res, next) => {
  // 개발 환경에서만 스택 트레이스 출력
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  } else {
    console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`);
  }

  const statusCode = err.statusCode || 500;

  // 500 에러는 내부 메시지를 클라이언트에 노출하지 않음
  const message = statusCode === 500
    ? '서버 내부 오류가 발생했습니다.'
    : err.message || '요청을 처리할 수 없습니다.';

  const response = ApiResponse.error(message);

  // 개발 환경에서만 스택 트레이스 포함
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};