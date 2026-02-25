import { Router } from 'express';
import authRoutes from './authRoutes.js';
import chatbotRoutes from './chatbotRoutes.js';
import exampleRoutes from './exampleRoutes.js';
import generateRoutes from './generateRoutes.js';
import questionRoutes from './questionRoutes.js';
import ttsRoutes from './ttsRoutes.js';
import wordRoutes from './wordRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/chat', chatbotRoutes);
router.use('/examples', exampleRoutes);
router.use('/generate', generateRoutes);
router.use('/questions', questionRoutes);
router.use('/tts', ttsRoutes);
router.use('/words', wordRoutes);

export default router;