import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { syncDatabase } from './config/database.js';
import './models/index.js';
import authRoutes from './routes/authRoutes.js';
import wordRoutes from './routes/wordRoutes.js';
import exampleRoutes from './routes/exampleRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import generateRoutes from './routes/generateRoutes.js';
import ttsRoutes from './routes/ttsRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// 허용할 프론트엔드 오리진
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // 프로덕션에서는 origin 없는 요청(Postman 등) 차단
    if (!origin) {
      if (IS_PRODUCTION) {
        return callback(new Error('Origin이 없는 요청은 허용되지 않습니다.'));
      }
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS 정책 위반: ${origin}`));
  },
  credentials: true, // httpOnly Cookie 전송을 위해 필수
}));

// 미들웨어 (cookieParser는 express.json 이전에 위치)
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'AI English Trainer API 서버가 정상 작동 중입니다!' });
});

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/examples', exampleRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/chat', chatbotRoutes);

// 에러 핸들러
app.use(errorHandler);

// 서버 시작
const startServer = async () => {
  await syncDatabase();
  app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 실행 중입니다. (환경: ${process.env.NODE_ENV || 'development'})`);
  });
};

startServer();