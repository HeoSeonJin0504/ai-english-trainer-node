import 'dotenv/config';

const requiredEnvVars = [
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'OPENAI_API_KEY',
  'JWT_SECRET',
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`필수 환경변수 ${varName}이(가) 설정되지 않았습니다.`);
  }
});

export default {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT || 3306,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '24h',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : [],
};