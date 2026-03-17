import authService from '../services/authService.js';
import ApiResponse from '../utils/ApiResponse.js';
import { setTokenCookie, clearTokenCookie } from '../config/jwt.js';
import { User } from '../models/index.js';
import logger from '../utils/logger.js';
import jwt from 'jsonwebtoken';

const getIp = (req) => {
  const raw = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
  return raw?.replace(/^::ffff:/, '') || raw;
};

export const signUp = async (req, res, next) => {
  const ip = getIp(req);
  try {
    const userData = req.body;
    const user = await authService.signUp(userData);
    logger.info(`[ai-english-trainer] 회원가입 성공 - 사용자: ${userData.username}, IP: ${ip}`);
    res.status(201).json(ApiResponse.success(user, '회원가입이 완료되었습니다.'));
  } catch (error) {
    logger.warn(`[ai-english-trainer] 회원가입 실패 - IP: ${ip}, ${error.message}`);
    next(error);
  }
};

export const login = async (req, res, next) => {
  const ip = getIp(req);
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);

    setTokenCookie(res, result.accessToken);
    const { accessToken, ...safeResult } = result;

    logger.info(`[ai-english-trainer] 로그인 성공 - 사용자: ${username}, IP: ${ip}`);
    res.json(ApiResponse.success(safeResult, '로그인 성공'));
  } catch (error) {
    logger.warn(`[ai-english-trainer] 로그인 실패 - 사용자: ${req.body?.username}, IP: ${ip}, ${error.message}`);
    next(error);
  }
};

export const logout = async (req, res, next) => {
  const ip = getIp(req);
  try {
    // accessToken 쿠키에서 사용자 정보 추출
    let username = '알 수 없음';
    const token = req.cookies?.accessToken;
    if (token) {
      try {
        const decoded = jwt.decode(token);
        username = decoded?.username || '알 수 없음';
      } catch (_) {}
    }

    clearTokenCookie(res);
    logger.info(`[ai-english-trainer] 로그아웃 성공 - 사용자: ${username}, IP: ${ip}`);
    res.json(ApiResponse.successMessage('로그아웃 되었습니다.'));
  } catch (error) {
    next(error);
  }
};

export const checkUsername = async (req, res, next) => {
  try {
    const { username } = req.query;
    const available = await authService.checkUsername(username);
    const message = available ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.';
    res.json(ApiResponse.success(available, message));
  } catch (error) {
    next(error);
  }
};

export const checkPhone = async (req, res, next) => {
  try {
    const { phone } = req.query;
    const available = await authService.checkPhone(phone);
    const message = available ? '사용 가능한 번호입니다.' : '이미 등록된 번호입니다.';
    res.json(ApiResponse.success(available, message));
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json(ApiResponse.error('사용자를 찾을 수 없습니다.'));
    }
    res.json(ApiResponse.success(user.toJSON()));
  } catch (error) {
    next(error);
  }
};

export default { signUp, login, logout, checkUsername, checkPhone, getMe };