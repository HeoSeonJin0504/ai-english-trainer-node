import chatbotService from '../services/chatbotService.js';
import { ChatRequest } from '../dto/ChatRequest.js';
import { getCurrentUserId } from '../middleware/authMiddleware.js';

// 챗봇 메시지 전송 POST /api/chat/message
export const sendMessage = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;

    // 유효성 검사
    const chatRequest = new ChatRequest(message, conversationId);
    chatRequest.validate();

    // authMiddleware가 보장하는 인증된 userId
    const userId = getCurrentUserId(req);

    const response = await chatbotService.sendMessage(userId, message, conversationId);

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('챗봇 메시지 전송 에러:', error);
    next(error);
  }
};

// 대화 히스토리 조회 GET /api/chat/history/:conversationId
export const getHistory = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const history = chatbotService.getConversationHistory(conversationId);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('대화 히스토리 조회 에러:', error);
    next(error);
  }
};

// 대화 삭제 DELETE /api/chat/:conversationId
export const deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const result = chatbotService.deleteConversation(conversationId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('대화 삭제 에러:', error);
    next(error);
  }
};

// 사용자의 대화 목록 조회 GET /api/chat/conversations
export const getConversations = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);

    const conversations = chatbotService.getUserConversations(userId);

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('대화 목록 조회 에러:', error);
    next(error);
  }
};

export default {
  sendMessage,
  getHistory,
  deleteConversation,
  getConversations,
};