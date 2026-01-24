import express from 'express';
import ttsController from '../controllers/ttsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { ttsValidation } from '../middleware/validation.js';

const router = express.Router();

router.use(authMiddleware);

// POST /api/tts/speak - 텍스트를 음성으로 변환
router.post('/speak', ttsValidation, ttsController.speak);

// GET /api/tts/status - TTS 서비스 상태 확인
router.get('/status', ttsController.status);

export default router;
