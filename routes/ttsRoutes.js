import express from 'express';
import { textToSpeech, checkStatus } from '../controllers/ttsController.js';

const router = express.Router();

// POST /api/tts/speak - 텍스트를 음성으로 변환
router.post('/speak', textToSpeech);

// GET /api/tts/status - TTS 서비스 상태 확인
router.get('/status', checkStatus);

export default router;