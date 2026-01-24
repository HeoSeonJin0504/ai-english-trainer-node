import express from 'express';
import generateController from '../controllers/generateController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { generateExampleValidation, generateQuestionValidation } from '../middleware/validation.js';

const router = express.Router();

router.use(authMiddleware);

// POST /api/generate/examples - 예문 생성
router.post('/examples', generateExampleValidation, generateController.generateExamples);

// POST /api/generate/questions - 문제 생성
router.post('/questions', generateQuestionValidation, generateController.generateQuestions);

export default router;
