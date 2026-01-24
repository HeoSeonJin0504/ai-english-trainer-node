import express from 'express';
import exampleController from '../controllers/exampleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { exampleValidation } from '../middleware/validation.js';

const router = express.Router();

router.use(authMiddleware);

// POST /api/examples - 예문 저장
router.post('/', exampleValidation, exampleController.saveExample);

// GET /api/examples - 내 예문 전체 조회
router.get('/', exampleController.getMyExamples);

// GET /api/examples/count - 예문 개수 조회
router.get('/count', exampleController.getExampleCount);

// GET /api/examples/search - 예문 검색
router.get('/search', exampleController.searchExamples);

// GET /api/examples/word/:wordId - 특정 단어의 예문 조회
router.get('/word/:wordId', exampleController.getExamplesByWord);

// GET /api/examples/:exampleId - 예문 상세 조회
router.get('/:exampleId', exampleController.getExample);

// DELETE /api/examples/:exampleId - 예문 삭제
router.delete('/:exampleId', exampleController.deleteExample);

export default router;
