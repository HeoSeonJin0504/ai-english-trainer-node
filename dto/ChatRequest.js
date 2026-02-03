// 챗봇 메시지 전송 요청
export class ChatRequest {
  constructor(message, conversationId = null) {
    this.message = message;           // 사용자 메시지
    this.conversationId = conversationId; // 대화 세션 ID (선택)
  }

  validate() {
    if (!this.message || this.message.trim().length === 0) {
      throw new Error('Message is required');
    }
    if (this.message.length > 1000) {
      throw new Error('Message is too long (max 1000 characters)');
    }
  }
}