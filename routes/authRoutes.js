import express from 'express';
import authController from '../controllers/authController.js';
import { signUpValidation, loginValidation } from '../middleware/validation.js';

const router = express.Router();

// POST /api/auth/signup - 회원가입
router.post('/signup', signUpValidation, authController.signUp);

// POST /api/auth/login - 로그인
router.post('/login', loginValidation, authController.login);

// GET /api/auth/check-username - 아이디 중복 확인
router.get('/check-username', authController.checkUsername);

// GET /api/auth/check-phone - 핸드폰 번호 중복 확인
router.get('/check-phone', authController.checkPhone);

export default router;
