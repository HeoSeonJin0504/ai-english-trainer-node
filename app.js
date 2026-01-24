import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { syncDatabase } from './config/database.js';
import './models/index.js';
import authRoutes from './routes/authRoutes.js';
import wordRoutes from './routes/wordRoutes.js';
import exampleRoutes from './routes/exampleRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import generateRoutes from './routes/generateRoutes.js';
import ttsRoutes from './routes/ttsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우트
app.get('/', (req, res) => {
  res.json({ message: 'AI English Trainer API 서버가 정상 작동 중입니다!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/examples', exampleRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/tts', ttsRoutes);

// 에러 핸들러
app.use(errorHandler);

// 서버 시작
const startServer = async () => {
  await syncDatabase();
  app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
  });
};

startServer();