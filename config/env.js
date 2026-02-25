import 'dotenv/config';

const requiredEnvVars = [
  'ENGLISH_DATABASE_URL',
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
  DATABASE_URL: process.env.ENGLISH_DATABASE_URL,
  JWT_SECRET: process.env.ENGLISH_JWT_SECRET,           
  JWT_EXPIRATION: process.env.ENGLISH_JWT_EXPIRATION || '24h',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : [],
};
