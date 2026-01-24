import express from 'express';
import wordController from '../controllers/wordController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { wordValidation } from '../middleware/validation.js';

const router = express.Router();

router.use(authMiddleware);

// POST /api/words - 단어 저장
router.post('/', wordValidation, wordController.saveWord);

// GET /api/words - 내 단어 전체 조회
router.get('/', wordController.getMyWords);

// GET /api/words/count - 단어 개수 조회
router.get('/count', wordController.getWordCount);

// GET /api/words/search - 단어 검색
router.get('/search', wordController.searchWords);

// GET /api/words/:wordId - 단어 상세 조회
router.get('/:wordId', wordController.getWord);

// DELETE /api/words/:wordId - 단어 삭제
router.delete('/:wordId', wordController.deleteWord);

export default router;
