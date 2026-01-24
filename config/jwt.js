import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRATION = parseInt(process.env.JWT_EXPIRATION) || 86400000; // 24시간

/**
 * JWT 토큰 생성
 */
export const createToken = (userId, username) => {
  return jwt.sign(
    { 
      userId, 
      username 
    },
    JWT_SECRET,
    { 
      expiresIn: JWT_EXPIRATION 
    }
  );
};

/**
 * JWT 토큰 검증
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * 토큰에서 사용자 ID 추출
 */
export const getUserIdFromToken = (token) => {
  const decoded = verifyToken(token);
  return decoded ? decoded.userId : null;
};

/**
 * 토큰에서 username 추출
 */
export const getUsernameFromToken = (token) => {
  const decoded = verifyToken(token);
  return decoded ? decoded.username : null;
};

export const getExpirationTime = () => JWT_EXPIRATION;

export default {
  createToken,
  verifyToken,
  getUserIdFromToken,
  getUsernameFromToken,
  getExpirationTime,
};