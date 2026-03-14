import express from 'express';
import authController from '../controllers/authController.js';
import oauthController from '../controllers/oauthController.js';
import { signUpValidation, loginValidation } from '../middleware/validation.js';
import { loginLimiter, signUpLimiter } from '../middleware/rateLimiter.js';
import passport from '../config/passport.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// 일반 로그인
// POST /api/auth/signup - 회원가입
router.post('/signup', signUpLimiter, signUpValidation, authController.signUp);

// POST /api/auth/login - 로그인
router.post('/login', loginLimiter, loginValidation, authController.login);

// POST /api/auth/logout - 로그아웃
router.post('/logout', authController.logout);

// GET /api/auth/check-username - 아이디 중복 확인
router.get('/check-username', authController.checkUsername);

// GET /api/auth/check-phone - 핸드폰 번호 중복 확인
router.get('/check-phone', authController.checkPhone);

// Google OAuth
// GET /api/auth/google - Google 로그인 페이지로 리다이렉트
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /api/auth/google/callback - Google 인증 후 콜백
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/oauth/failure' }),
  oauthController.oauthCallback
);

// Kakao OAuth
// GET /api/auth/kakao - Kakao 로그인 페이지로 리다이렉트
router.get('/kakao', passport.authenticate('kakao'));

// GET /api/auth/kakao/callback - Kakao 인증 후 콜백
router.get('/kakao/callback',
  passport.authenticate('kakao', { session: false, failureRedirect: '/api/auth/oauth/failure' }),
  oauthController.oauthCallback
);

// Naver OAuth
// GET /api/auth/naver - Naver 로그인 페이지로 리다이렉트
router.get('/naver', passport.authenticate('naver'));

// GET /api/auth/naver/callback - Naver 인증 후 콜백
router.get('/naver/callback',
  passport.authenticate('naver', { session: false, failureRedirect: '/api/auth/oauth/failure' }),
  oauthController.oauthCallback
);

// GET /api/auth/me - 현재 로그인된 사용자 정보 조회
router.get('/me', authMiddleware, authController.getMe);

// OAuth 공통 실패 처리
// GET /api/auth/oauth/failure - OAuth 인증 실패
router.get('/oauth/failure', oauthController.oauthFailure);

export default router;