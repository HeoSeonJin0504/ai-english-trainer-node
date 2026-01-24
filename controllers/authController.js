import authService from '../services/authService.js';
import ApiResponse from '../utils/ApiResponse.js';

// 회원가입, POST /api/auth/signup
export const signUp = async (req, res, next) => {
  try {
    const userData = req.body;
    const user = await authService.signUp(userData);
    
    res.status(201).json(
      ApiResponse.success(user, '회원가입이 완료되었습니다.')
    );
  } catch (error) {
    next(error);
  }
};

// 로그인, POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    
    res.json(ApiResponse.success(result, '로그인 성공'));
  } catch (error) {
    next(error);
  }
};

// GET, /api/auth/check-username?username=xxx
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

// 핸드폰 번호 중복 확인, GET /api/auth/check-phone?phone=xxx
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

export default {
  signUp,
  login,
  checkUsername,
  checkPhone,
};
