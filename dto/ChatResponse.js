// 챗봇 응답
export class ChatResponse {
  constructor(message, conversationId, suggestions = []) {
    this.message = message;              // AI 응답 메시지
    this.conversationId = conversationId; // 대화 세션 ID
    this.suggestions = suggestions;       // 추천 질문/응답 (선택)
    this.timestamp = new Date().toISOString();
  }
}