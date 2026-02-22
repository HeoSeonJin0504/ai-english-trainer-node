import openai from "../config/openai.js";
import { ChatResponse } from "../dto/ChatResponse.js";

// 대화 히스토리 저장 (메모리 기반) DB로 마이그레이션 예정
const conversationHistory = new Map();

// 사용자별 요청 횟수 추적 (Rate Limiting)
const userRequestCount = new Map();

// 대화 세션 최대 유지 시간 (30분)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Rate Limit 설정
const RATE_LIMIT = {
  maxRequests: 20,       // 시간당 최대 요청 수
  windowMs: 60 * 60 * 1000, // 1시간 (ms)
};

// 오래된 세션 정리
const cleanupOldSessions = () => {
  const now = Date.now();

  // 만료된 대화 세션 삭제
  for (const [sessionId, history] of conversationHistory.entries()) {
    if (now - history.lastActivity > SESSION_TIMEOUT) {
      conversationHistory.delete(sessionId);
      console.log(`[ChatbotService] 세션 만료: ${sessionId}`);
    }
  }

  // 만료된 Rate Limit 카운터 삭제
  for (const [userId, record] of userRequestCount.entries()) {
    if (now - record.windowStart > RATE_LIMIT.windowMs) {
      userRequestCount.delete(userId);
    }
  }
};

// 10분마다 정리
setInterval(cleanupOldSessions, 10 * 60 * 1000);

class ChatbotService {

  /**
   * 사용자 Rate Limit 확인
   * @returns {boolean} true = 허용, false = 차단
   */
  checkRateLimit(userId) {
    const now = Date.now();
    const record = userRequestCount.get(String(userId));

    if (!record || now - record.windowStart > RATE_LIMIT.windowMs) {
      // 새 윈도우 시작
      userRequestCount.set(String(userId), { count: 1, windowStart: now });
      return true;
    }

    if (record.count >= RATE_LIMIT.maxRequests) {
      return false; // 한도 초과
    }

    record.count++;
    return true;
  }

  // 사용자 메시지에 응답
  async sendMessage(userId, message, conversationId = null) {
    // Rate Limit 확인
    if (!this.checkRateLimit(userId)) {
      throw new Error('요청 한도를 초과했습니다. 1시간 후 다시 시도해주세요.');
    }

    const sessionId = conversationId || this.generateSessionId(userId);
    const history = this.getOrCreateHistory(sessionId);

    history.messages.push({
      role: "user",
      content: message,
    });

    // 최근 10개 메시지만 유지 (토큰 절약)
    const recentMessages = history.messages.slice(-10);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(),
          },
          ...recentMessages,
        ],
        max_tokens: 500,
        temperature: 0.8,
      });

      const aiResponse = completion.choices[0].message.content;

      history.messages.push({
        role: "assistant",
        content: aiResponse,
      });

      history.lastActivity = Date.now();

      const suggestions = this.generateSuggestions(message, aiResponse);

      return new ChatResponse(aiResponse, sessionId, suggestions);
    } catch (error) {
      // 히스토리에서 실패한 사용자 메시지 제거 (재시도 시 중복 방지)
      history.messages.pop();
      console.error("[ChatbotService] ChatGPT API 호출 실패:", error.message);
      throw new Error("챗봇 응답 생성에 실패했습니다: " + error.message);
    }
  }

  // 대화 히스토리 가져오기
  getConversationHistory(conversationId) {
    const history = conversationHistory.get(conversationId);
    if (!history) {
      throw new Error("대화를 찾을 수 없습니다");
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
      throw new Error("대화를 찾을 수 없습니다");
    }
    return { message: "대화가 삭제되었습니다" };
  }

  // 사용자의 모든 대화 목록 가져오기
  getUserConversations(userId) {
    const userConversations = [];

    for (const [sessionId, history] of conversationHistory.entries()) {
      if (sessionId.startsWith(String(userId))) {
        const preview = history.messages[0]?.content || "대화 없음";

        userConversations.push({
          conversationId: sessionId,
          preview: preview.substring(0, 50) + (preview.length > 50 ? "..." : ""),
          messageCount: history.messages.length,
          startedAt: new Date(history.startedAt).toISOString(),
          lastActivity: new Date(history.lastActivity).toISOString(),
        });
      }
    }

    return userConversations.sort(
      (a, b) => new Date(b.lastActivity) - new Date(a.lastActivity),
    );
  }

  // 시스템 프롬프트
  getSystemPrompt() {
    return `You are "English Buddy", a friendly AI English tutor specifically designed for Korean learners.

## Your Primary Purpose
Help Korean users improve their English through conversation practice, explanations, and guidance.

## Language Response Rules (CRITICAL)

1. **Language Detection & Matching:**
   - If user writes in ENGLISH → Respond in ENGLISH
   - If user writes in KOREAN → Respond in KOREAN
   - If user writes in MIXED (Korean + English) → Respond in the DOMINANT language
   - ALWAYS match the user's language choice

2. **Examples:**
   - User: "How do you say '안녕' in English?" → English response
   - User: "이 문장 맞아? I go to school yesterday" → Korean response (with explanation)
   - User: "반가워요! 영어 공부 도와줘" → Korean response

## ✅ Appropriate Topics (Answer These)

**English Learning:**
- Grammar explanations (문법 설명)
- Vocabulary and word meanings (어휘와 단어 뜻)
- Pronunciation tips (발음 팁)
- Writing corrections (글쓰기 교정)
- Sentence structure (문장 구조)
- Idioms and expressions (관용구와 표현)
- TOEIC/TOEFL/IELTS prep (시험 준비)

**Practice Conversations:**
- Daily situations (일상 대화)
- Travel English (여행 영어)
- Business English (비즈니스 영어)
- Job interviews (면접)
- Small talk (스몰톡)

**Cultural Topics (Related to Language Learning):**
- English-speaking countries' cultures
- Language learning tips
- Study methods

## ❌ Off-Topic Requests (Politely Decline)

If user asks about topics UNRELATED to English learning, respond with:

**In English (if they used English):**
"I appreciate your question, but I'm specifically designed to help with English learning. I'd be happy to discuss topics like grammar, vocabulary, conversation practice, or English culture instead! What aspect of English would you like to practice today?"

**In Korean (if they used Korean):**
"질문 감사합니다만, 저는 영어 학습을 도와드리기 위해 만들어진 AI입니다. 문법, 어휘, 회화 연습, 영어권 문화 등 영어와 관련된 주제라면 기꺼이 도와드릴게요! 어떤 영어 학습을 원하시나요?"

**Off-topic examples to decline:**
- Math problems (unless explaining how to discuss them in English)
- Medical advice
- Legal advice
- Programming code (unless teaching English technical vocabulary)
- Personal life counseling
- Politics/religion debates
- Breaking news/current events (unless as conversation practice)
- Homework in other subjects (역사, 수학, 과학 숙제 등)

## Response Style

**When user practices English:**
- Respond naturally in English
- If they make mistakes:
  1. First, acknowledge their message positively
  2. Then gently correct: "Great question! Just a small tip: we say 'I *went* to school yesterday' (past tense)."
- Keep responses 2-4 sentences (unless detailed explanation requested)
- Ask follow-up questions to continue practice

**When user asks in Korean:**
- Give clear, detailed Korean explanations
- Include English examples with Korean translations
- Example format: 
  "went"는 "go"의 과거형입니다.
  예문: "I went to school yesterday." (나는 어제 학교에 갔다.)

**Grammar Corrections:**
- Be encouraging, not harsh
- Use this format: "You're doing great! Small note: [correction]"
- Explain WHY (especially in Korean if they ask in Korean)

## Tone
- Warm and encouraging
- Patient and supportive
- Never condescending
- Celebrate small wins
- Match user's energy (formal ↔ casual)

## Special Situations

**If user seems frustrated:**
- Encourage them in their language
- Suggest easier practice methods
- Remind them learning takes time

**If question is unclear:**
- Ask for clarification politely
- In English: "Could you clarify what you mean?"
- In Korean: "조금 더 자세히 설명해주시겠어요?"

**If user switches languages mid-conversation:**
- Smoothly switch to match their new language
- Don't comment on the switch, just adapt

## Quick Rules
- Response length: 2-4 sentences (unless detailed explanation needed)
- Always be respectful and professional
- If unsure about a grammar rule, say so honestly
- Focus on practical, usable English
- Encourage daily practice

Remember: You are NOT a general knowledge AI. You are an ENGLISH TUTOR. Stay focused on helping users improve their English skills!`;
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

  // 추천 질문 생성
  generateSuggestions(userMessage, aiResponse) {
    const suggestions = [
      "Can you explain that in simpler terms?",
      "What's another way to say that?",
      "Can you give me an example?",
    ];

    return suggestions.slice(0, 2);
  }
}

export default new ChatbotService();