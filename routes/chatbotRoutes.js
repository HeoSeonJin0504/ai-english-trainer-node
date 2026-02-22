import express from 'express';
import {
  sendMessage,
  getHistory,
  deleteConversation,
  getConversations,
} from '../controllers/chatbotController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// 모든 챗봇 라우트에 인증 적용
router.use(authMiddleware);

// POST /api/chat/message - 챗봇에게 메시지 전송
router.post('/message', sendMessage);

// GET /api/chat/conversations - 사용자의 모든 대화 목록
router.get('/conversations', getConversations);

// GET /api/chat/history/:conversationId - 특정 대화 히스토리
router.get('/history/:conversationId', getHistory);

// DELETE /api/chat/:conversationId - 대화 삭제
router.delete('/:conversationId', deleteConversation);

export default router;