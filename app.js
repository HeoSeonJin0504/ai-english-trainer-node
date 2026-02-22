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

// ✅ X-Powered-By 헤더 제거 (서버 정보 노출 방지)
app.disable('x-powered-by');

// 허용할 프론트엔드 오리진
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // origin이 없는 요청 (Postman 등)
    if (!origin) {
      // 프로덕션에서는 차단, 개발환경에서는 허용
      if (IS_PRODUCTION) {
        return callback(null, false);
      }
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`[CORS] 차단된 오리진: ${origin}`);
    return callback(null, false);
  },
  credentials: true, // httpOnly Cookie 전송을 위해 필수
}));

// 미들웨어
app.use(cookieParser());
app.use(express.json({ limit: '10kb' })); // 요청 본문 크기 제한 (DoS 방지)

// 루트
app.get('/', (req, res) => {
  res.json({ message: 'AI English Trainer API 서버가 정상 작동 중입니다!' });
});

// 헬스체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/examples', exampleRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/chat', chatbotRoutes);

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ success: false, message: '요청한 경로를 찾을 수 없습니다.' });
});

// 에러 핸들러 (반드시 마지막에 위치)
app.use(errorHandler);

// 서버 시작
const startServer = async () => {
  await syncDatabase();
  app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 실행 중입니다. (환경: ${process.env.NODE_ENV || 'development'})`);
  });
};

startServer();