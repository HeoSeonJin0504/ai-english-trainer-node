import ttsService from '../services/ttsService.js';
import ApiResponse from '../utils/ApiResponse.js';

// 텍스트를 음성으로 변환, POST /api/tts/speak
export const speak = async (req, res, next) => {
  try {
    const { text, speed, voice } = req.body;

    const result = await ttsService.synthesizeSpeech(text, speed, voice);

    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

// TTS 서비스 상태 확인, GET /api/tts/status
export const status = async (req, res, next) => {
  try {
    const result = ttsService.checkStatus();

    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

export default {
  speak,
  status,
};