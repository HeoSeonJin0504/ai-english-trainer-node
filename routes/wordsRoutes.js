import express from 'express';
import { getWords, addWord, deleteWord } from '../controllers/wordsController.js';

const router = express.Router();

router.get('/', getWords);
router.post('/', addWord);
router.delete('/:id', deleteWord);

export default router;