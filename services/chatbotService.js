import openai from '../config/openai.js';
import { ChatResponse } from '../dto/ChatResponse.js';

// 대화 히스토리 저장 (메모리 기반 - 나중에 DB로 이전 가능)
const conversationHistory = new Map();

// 대화 세션 최대 유지 시간 (30분)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// 챗봇 서비스
class ChatbotService {
  // 사용자 메시지에 응답
  async sendMessage(userId, message, conversationId = null) {
    // 대화 세션 ID 생성 또는 기존 세션 사용
    const sessionId = conversationId || this.generateSessionId(userId);

    // 대화 히스토리 가져오기 또는 생성
    const history = this.getOrCreateHistory(sessionId);

    // 사용자 메시지 추가
    history.messages.push({
      role: 'user',
      content: message,
    });

    // 최근 10개 메시지만 유지 (토큰 절약)
    const recentMessages = history.messages.slice(-10);

    try {
      // OpenAI API 호출
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          ...recentMessages,
        ],
        max_tokens: 500,
        temperature: 0.8,
      });

      const aiResponse = completion.choices[0].message.content;

      // AI 응답 히스토리에 추가
      history.messages.push({
        role: 'assistant',
        content: aiResponse,
      });

      // 마지막 활동 시간 업데이트
      history.lastActivity = Date.now();

      // 추천 질문 생성 (선택적)
      const suggestions = this.generateSuggestions(message, aiResponse);

      return new ChatResponse(aiResponse, sessionId, suggestions);
    } catch (error) {
      console.error('ChatGPT API 호출 실패:', error);
      throw new Error('챗봇 응답 생성에 실패했습니다: ' + error.message);
    }
  }

  // 대화 히스토리 가져오기
  getConversationHistory(conversationId) {
    const history = conversationHistory.get(conversationId);
    if (!history) {
      throw new Error('대화를 찾을 수 없습니다');
    }

    return {
      conversationId,
      messages: history.messages,
      startedAt: new Date(history.startedAt).toISOString(),
      lastActivity: new Date(history.lastActivity).toISOString(),
    };
  }

  // 대화 삭제
  deleteConversation(conversationId) {
    const deleted = conversationHistory.delete(conversationId);
    if (!deleted) {
      throw new Error('대화를 찾을 수 없습니다');
    }
    return { message: '대화가 삭제되었습니다' };
  }

  // 사용자의 모든 대화 목록 가져오기
  getUserConversations(userId) {
    const userConversations = [];

    for (const [sessionId, history] of conversationHistory.entries()) {
      if (sessionId.startsWith(userId)) {
        // 첫 번째 메시지 미리보기
        const preview = history.messages[0]?.content || '대화 없음';
        
        userConversations.push({
          conversationId: sessionId,
          preview: preview.substring(0, 50) + (preview.length > 50 ? '...' : ''),
          messageCount: history.messages.length,
          startedAt: new Date(history.startedAt).toISOString(),
          lastActivity: new Date(history.lastActivity).toISOString(),
        });
      }
    }

    return userConversations.sort((a, b) => 
      new Date(b.lastActivity) - new Date(a.lastActivity)
    );
  }

  // 시스템 프롬프트 (챗봇 역할 정의)
  getSystemPrompt() {
    return `You are a friendly and helpful English conversation partner for Korean learners.

Your role:
- Have natural conversations in English
- Correct grammar mistakes gently when you notice them
- Explain difficult words or expressions when asked
- Encourage the user to practice speaking/writing in English
- Keep responses concise (2-4 sentences usually)
- Be supportive and positive

Important:
- Always respond in English (unless the user specifically asks for Korean explanations)
- If the user makes a mistake, acknowledge their message first, then gently correct it
- Match your English level to the user's proficiency
- Ask follow-up questions to keep the conversation going`;
  }

  // 대화 세션 ID 생성
  generateSessionId(userId) {
    return `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 대화 히스토리 가져오기 또는 생성
  getOrCreateHistory(sessionId) {
    if (!conversationHistory.has(sessionId)) {
      conversationHistory.set(sessionId, {
        messages: [],
        startedAt: Date.now(),
        lastActivity: Date.now(),
      });
    }

    return conversationHistory.get(sessionId);
  }

  // 추천 질문 생성 (간단한 로직)
  generateSuggestions(userMessage, aiResponse) {
    // 간단한 추천 질문 템플릿
    const suggestions = [
      "Can you explain that in simpler terms?",
      "What's another way to say that?",
      "Can you give me an example?",
    ];

    return suggestions.slice(0, 2); // 2개만 반환
  }

  // 오래된 대화 세션 정리 (메모리 관리)
  cleanupOldSessions() {
    const now = Date.now();
    for (const [sessionId, history] of conversationHistory.entries()) {
      if (now - history.lastActivity > SESSION_TIMEOUT) {
        conversationHistory.delete(sessionId);
        console.log(`세션 만료: ${sessionId}`);
      }
    }
  }
}

// 30분마다 오래된 세션 정리
setInterval(() => {
  const service = new ChatbotService();
  service.cleanupOldSessions();
}, 10 * 60 * 1000); // 10분마다 실행

export default new ChatbotService();