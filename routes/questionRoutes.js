import express from 'express';
import questionController from '../controllers/questionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { questionSaveValidation } from '../middleware/validation.js';

const router = express.Router();

router.use(authMiddleware);

// POST /api/questions - 문제 저장
router.post('/', questionSaveValidation, questionController.saveQuestion);

// GET /api/questions - 내 문제 전체 조회
router.get('/', questionController.getMyQuestions);

// GET /api/questions/count - 문제 개수 조회
router.get('/count', questionController.getQuestionCount);

// GET /api/questions/search - 주제별 문제 검색
router.get('/search', questionController.searchQuestions);

// GET /api/questions/toeic - 토익 문제 조회
router.get('/toeic', questionController.getToeicQuestions);

// GET /api/questions/toeic/count - 토익 문제 개수 조회
router.get('/toeic/count', questionController.getToeicQuestionCount);

// GET /api/questions/toeic/:part - 토익 파트별 문제 조회
router.get('/toeic/:part', questionController.getToeicQuestionsByPart);

// GET /api/questions/writing - 영작 문제 조회
router.get('/writing', questionController.getWritingQuestions);

// GET /api/questions/writing/count - 영작 문제 개수 조회
router.get('/writing/count', questionController.getWritingQuestionCount);

// GET /api/questions/:questionId - 문제 상세 조회
router.get('/:questionId', questionController.getQuestion);

// DELETE /api/questions/:questionId - 문제 삭제
router.delete('/:questionId', questionController.deleteQuestion);

export default router;
