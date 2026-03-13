import 'dotenv/config';

const requiredEnvVars = [
  'ENGLISH_DB_NAME',
  'ENGLISH_DB_USER',
  'ENGLISH_DB_PASSWORD',
  'OPENAI_API_KEY',
  'ENGLISH_JWT_SECRET',
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`필수 환경변수 ${varName}이(가) 설정되지 않았습니다.`);
  }
});

export default {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // MySQL
  DB_HOST: process.env.ENGLISH_DB_HOST || 'localhost',
  DB_PORT: process.env.ENGLISH_DB_PORT || 3306,
  DB_NAME: process.env.ENGLISH_DB_NAME,
  DB_USER: process.env.ENGLISH_DB_USER,
  DB_PASSWORD: process.env.ENGLISH_DB_PASSWORD,

  // JWT
  JWT_SECRET: process.env.ENGLISH_JWT_SECRET,
  JWT_EXPIRATION: process.env.ENGLISH_JWT_EXPIRATION || '24h',

  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',

  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : [],

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',

  // Kakao OAuth
  KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID || '',
  KAKAO_CLIENT_SECRET: process.env.KAKAO_CLIENT_SECRET || '',
  KAKAO_CALLBACK_URL: process.env.KAKAO_CALLBACK_URL || 'http://localhost:3000/api/auth/kakao/callback',

  // Naver OAuth
  NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID || '',
  NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET || '',
  NAVER_CALLBACK_URL: process.env.NAVER_CALLBACK_URL || 'http://localhost:3000/api/auth/naver/callback',

  // OAuth 콜백 후 프론트엔드 리다이렉트 URL
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};