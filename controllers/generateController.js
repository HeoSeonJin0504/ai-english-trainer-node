import openai from '../config/openai.js';

// 예문 생성
export const generateExamples = async (req, res, next) => {
  try {
    const { word } = req.body;

    if (!word) {
      return res.status(400).json({ error: 'Word is required' });
    }

    console.log('=== 예문 생성 요청 ===');
    console.log('단어:', word);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 영어 교사입니다. 학습자에게 유용한 예문을 작성해주세요.',
        },
        {
          role: 'user',
          content: `"${word}" 단어를 사용한 예문 5개를 만들어주세요.

요구사항:
- 각 예문은 실생활에서 자주 쓰이는 표현으로 작성
- 난이도는 중급 수준 (너무 쉽거나 어렵지 않게)
- 다양한 문맥과 상황 포함
- 각 예문마다 정확한 한국어 번역 제공

아래 JSON 형식으로만 응답하세요:
{
  "examples": [
    {
      "english": "영어 예문",
      "korean": "한국어 번역"
    }
  ]
}`,
        },
      ],
      max_tokens: 250,
      temperature: 0.7,
    });

    console.log('=== GPT API 전체 응답 ===');
    console.log(JSON.stringify(completion, null, 2));

    const content = completion.choices[0].message.content;
    console.log('=== 생성된 원본 내용 ===');
    console.log(content);

    // JSON 파싱
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON 형식 응답을 찾을 수 없습니다');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const examples = parsed.examples;

    console.log('=== 파싱된 예문 배열 ===');
    console.log(examples);

    res.json({ word, examples });
  } catch (error) {
    console.error('=== 예문 생성 에러 ===');
    console.error(error);
    next(error);
  }
};


// 문제 생성
export const generateQuestions = async (req, res, next) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    console.log('=== 문제 생성 요청 ===');
    console.log('주제:', topic);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 영어 시험 문제를 출제하는 전문가입니다. 학습 효과가 높은 문제를 만들어주세요.',
        },
        {
          role: 'user',
          content: `"${topic}" 주제로 4지선다 영어 퀴즈 5개를 만들어주세요.

요구사항:
- 문제는 해당 주제의 핵심 개념을 다루어야 함
- 난이도는 중급 수준
- 오답 선택지도 그럴듯하게 작성 (너무 명백한 오답은 제외)
- 문제와 선택지는 영어로, 문제 설명은 한국어로 제공
- 정답은 A, B, C, D 중 하나로 명확히 표시

아래 JSON 형식으로만 응답하세요:
{
  "questions": [
    {
      "question": "영어 질문",
      "translation": "한국어 설명",
      "options": {
        "A": "선택지 1",
        "B": "선택지 2",
        "C": "선택지 3",
        "D": "선택지 4"
      },
      "answer": "정답 (A, B, C, D 중 하나)"
    }
  ]
}`,
        },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    console.log('=== GPT API 전체 응답 ===');
    console.log(JSON.stringify(completion, null, 2));

    const content = completion.choices[0].message.content;
    console.log('=== 생성된 원본 내용 ===');
    console.log(content);

    // JSON 파싱
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON 형식 응답을 찾을 수 없습니다');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const questions = parsed.questions;

    console.log('=== 파싱된 문제 배열 ===');
    console.log(questions);

    res.json({ topic, questions });
  } catch (error) {
    console.error('=== 문제 생성 에러 ===');
    console.error(error);
    next(error);
  }
};