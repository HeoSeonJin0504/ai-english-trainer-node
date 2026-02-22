import rateLimit from 'express-rate-limit';

// 공통 에러 응답 형식
const handler = (req, res) => {
  res.status(429).json({
    success: false,
    message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  });
};

/**
 * 로그인 제한
 * - IP당 1시간에 5회
 */
export const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/**
 * 회원가입 제한
 * - IP당 1시간에 5회
 * - 계정 생성 남용 방지
 */
export const signUpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/**
 * 예문/문제 생성 제한 
 * - IP당 1시간에 5회
 */
export const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/**
 * 챗봇 메시지 제한
 * - IP당 1시간에 10회
 */
export const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/**
 * TTS 제한
 * - IP당 1시간에 10회
 */
export const ttsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/**
 * 일반 API 글로벌 제한
 * - IP당 1분에 50회
 */
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

export default {
  loginLimiter,
  signUpLimiter,
  generateLimiter,
  chatLimiter,
  ttsLimiter,
  globalLimiter,
};