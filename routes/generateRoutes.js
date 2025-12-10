import express from 'express';
import { generateExamples, generateQuestions } from '../controllers/generateController.js';

const router = express.Router();

router.post('/examples', generateExamples);
router.post('/questions', generateQuestions);

export default router;