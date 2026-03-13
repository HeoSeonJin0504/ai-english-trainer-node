import { setTokenCookie } from '../config/jwt.js';
import { createToken } from '../config/jwt.js';
import config from '../config/env.js';
import ApiResponse from '../utils/ApiResponse.js';

// OAuth 콜백 공통 처리 (Google, Kakao, Naver 모두 여기로)
export const oauthCallback = (req, res) => {
  try {
    // passport가 req.user에 인증된 사용자 정보를 넣어줌
    const user = req.user;

    // JWT 발급
    const token = createToken(user.id, user.username);

    // httpOnly Cookie 세팅
    setTokenCookie(res, token);

    // 프론트엔드로 리다이렉트
    res.redirect(`${config.CLIENT_URL}/oauth/success`);
  } catch (error) {
    console.error('OAuth 콜백 처리 에러:', error);
    res.redirect(`${config.CLIENT_URL}/oauth/failure`);
  }
};

// OAuth 인증 실패 처리
export const oauthFailure = (req, res) => {
  res.status(401).json(
    ApiResponse.error('소셜 로그인에 실패했습니다. 다시 시도해주세요.')
  );
};

export default {
  oauthCallback,
  oauthFailure,
};