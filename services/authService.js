import { User } from '../models/index.js';
import { createToken, getExpirationTime } from '../config/jwt.js';
import { DuplicateException, UnauthorizedException } from '../utils/errors.js';
import { Op } from 'sequelize';

// 회원가입
export const signUp = async (userData) => {
  const { username, password, phone, email, gender, age } = userData;

  // 아이디 중복 확인
  const existingUsername = await User.findOne({ where: { username } });
  if (existingUsername) {
    throw new DuplicateException('이미 사용 중인 아이디입니다.');
  }

  // 핸드폰 번호 중복 확인
  const existingPhone = await User.findOne({ where: { phone } });
  if (existingPhone) {
    throw new DuplicateException('이미 등록된 핸드폰 번호입니다.');
  }

  // 이메일 중복 확인 (입력된 경우만)
  if (email) {
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      throw new DuplicateException('이미 등록된 이메일입니다.');
    }
  }

  // 사용자 생성
  const user = await User.create({
    username,
    password,
    phone,
    email: email || null,
    gender,
    age,
  });

  return user.toJSON();
};

// 로그인
export const login = async (username, password) => {
  // 사용자 조회
  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않습니다.');
  }

  // 비밀번호 확인
  const isValid = await user.validatePassword(password);
  if (!isValid) {
    throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않습니다.');
  }

  // JWT 토큰 생성
  const token = createToken(user.id, user.username);

  return {
    accessToken: token,
    tokenType: 'Bearer',
    expiresIn: getExpirationTime(),
    user: {
      id: user.id,
      username: user.username,
      phone: user.phone,
      email: user.email,
    },
  };
};

// 아이디 중복 확인
export const checkUsername = async (username) => {
  const exists = await User.findOne({ where: { username } });
  return !exists; // 사용 가능하면 true
};

// 핸드폰 번호 중복 확인
export const checkPhone = async (phone) => {
  const exists = await User.findOne({ where: { phone } });
  return !exists; // 사용 가능하면 true
};

export default {
  signUp,
  login,
  checkUsername,
  checkPhone,
};
