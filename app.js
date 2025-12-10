import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateRoutes from './routes/generateRoutes.js';
import wordsRoutes from './routes/wordsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우트
app.use('/api/generate', generateRoutes);
app.use('/api/words', wordsRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'English Learning API Server' });
});

// 에러 핸들러
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 열리고 있습니다.`);
});