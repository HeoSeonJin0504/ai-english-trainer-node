import openai from '../config/openai.js';

// 예문 생성 (단어 정보, 예문, 유의어/반의어 포함)
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
          content: `당신은 영어 교육 전문가입니다. 학습자가 단어를 깊이 이해할 수 있도록 상세한 정보를 제공해주세요.`,
        },
        {
          role: 'user',
          content: `"${word}"가 유효한 영어 단어인지 먼저 확인하고, 학습 자료를 만들어주세요.

🔍 단어 유효성 검사:
- 입력값이 실제 영어 사전에 존재하는 단어인가?
- 의미 없는 문자열, 숫자, 특수문자만 있는가?
- 너무 긴 문장이나 여러 단어가 합쳐진 것은 아닌가?

❌ 유효하지 않은 경우:
{
  "isValid": false,
  "errorMessage": "입력하신 '${word}'는(은) 유효한 영어 단어가 아닙니다. 올바른 영어 단어를 입력해주세요."
}

✅ 유효한 경우:

📌 중요: "meanings" 배열을 반드시 사용하세요!
- 단어의 모든 주요 의미를 meanings 배열에 담아주세요 (최대 3개)
- 각 의미마다 별도의 객체로 분리해주세요
- 예: "train"은 명사(기차)와 동사(훈련하다)를 각각 분리
- 예: "interest"는 명사(관심), 명사(이자), 동사(흥미를 갖게 하다)로 분리

예문 작성:
- 단어의 다양한 의미를 골고루 커버하는 예문 3개
- 각 예문에 meaningIndex 필드 필수 (0부터 시작)
- meaningIndex는 meanings 배열의 인덱스와 일치

반드시 아래 JSON 형식을 정확히 따라주세요:

{
  "isValid": true,
  "word": {
    "original": "${word}",
    "meanings": [
      {
        "partOfSpeech": "명사",
        "meaning": "첫 번째 의미"
      },
      {
        "partOfSpeech": "동사",
        "meaning": "두 번째 의미"
      }
    ]
  },
  "examples": [
    {
      "english": "영어 예문 1",
      "korean": "한국어 번역 1",
      "meaningIndex": 0
    },
    {
      "english": "영어 예문 2",
      "korean": "한국어 번역 2",
      "meaningIndex": 1
    },
    {
      "english": "영어 예문 3",
      "korean": "한국어 번역 3",
      "meaningIndex": 0
    }
  ],
  "relatedWords": {
    "synonym": {
      "word": "유의어",
      "partOfSpeech": "품사",
      "meaning": "한국어 뜻"
    },
    "antonym": {
      "word": "반의어",
      "partOfSpeech": "품사",
      "meaning": "한국어 뜻"
    }
  }
}

⚠️ 절대 하지 말 것:
- ❌ "partOfSpeech": "동사, 명사" (쉼표로 구분하지 마세요!)
- ❌ "meaning": "기차; 훈련하다" (세미콜론으로 구분하지 마세요!)
- ✅ meanings 배열을 사용하여 각각 분리하세요!

⚠️ 주의사항:
- isValid 필드는 필수
- meanings는 배열 형태로 최소 1개, 최대 3개
- 각 meaning 객체는 partOfSpeech와 meaning 필드 포함
- examples는 정확히 3개
- 각 example에 meaningIndex 필드 필수 (0부터 시작)
- 품사는 한국어로 명확하게 표기 (명사, 동사, 형용사, 부사, 전치사 등)
- 반의어가 없으면 antonym을 null로 설정
- 다른 설명이나 텍스트 추가하지 말고 JSON만 반환`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    console.log('=== GPT API 전체 응답 ===');
    console.log(JSON.stringify(completion, null, 2));

    const content = completion.choices[0].message.content;
    console.log('=== 생성된 원본 내용 ===');
    console.log(content);

    // finish_reason 체크
    if (completion.choices[0].finish_reason === 'length') {
      console.warn('⚠️ 응답이 잘렸습니다. max_tokens를 늘려야 합니다.');
    }

    // JSON 파싱
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON 형식 응답을 찾을 수 없습니다');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    console.log('=== 파싱된 데이터 ===');
    console.log(JSON.stringify(parsed, null, 2));

    // 단어 유효성 검사
    if (parsed.isValid === false) {
      console.log('❌ 유효하지 않은 단어:', word);
      return res.status(400).json({
        error: 'Invalid word',
        message: parsed.errorMessage || '유효한 영어 단어가 아닙니다.',
        word: word
      });
    }

    // 데이터 검증
    if (!parsed.word || !parsed.word.meanings || !Array.isArray(parsed.word.meanings)) {
      throw new Error('응답 형식이 올바르지 않습니다 - word.meanings가 필요합니다');
    }

    if (!parsed.examples || !Array.isArray(parsed.examples)) {
      throw new Error('응답 형식이 올바르지 않습니다 - examples가 필요합니다');
    }

    // 예문 개수 확인
    if (parsed.examples.length !== 3) {
      console.warn('⚠️ 예문이 3개가 아닙니다:', parsed.examples.length);
    }

    // meanings 개수 확인
    if (parsed.word.meanings.length === 0 || parsed.word.meanings.length > 3) {
      console.warn('⚠️ meanings 개수가 1-3개 범위를 벗어났습니다:', parsed.word.meanings.length);
    }

    res.json(parsed);
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
      max_tokens: 600,
      temperature: 0.7,
    });

    console.log('=== GPT API 전체 응답 ===');
    console.log(JSON.stringify(completion, null, 2));

    const content = completion.choices[0].message.content;
    console.log('=== 생성된 원본 내용 ===');
    console.log(content);

    // finish_reason 체크
    if (completion.choices[0].finish_reason === 'length') {
      console.warn('⚠️ 응답이 잘렸습니다. max_tokens를 늘려야 합니다.');
    }

    // JSON 파싱
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON 형식 응답을 찾을 수 없습니다');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const questions = parsed.questions;

    console.log('=== 파싱된 문제 배열 ===');
    console.log(questions);

    // 문제 개수 확인
    if (questions.length !== 5) {
      console.warn('⚠️ 문제가 5개가 아닙니다:', questions.length);
    }

    res.json({ topic, questions });
  } catch (error) {
    console.error('=== 문제 생성 에러 ===');
    console.error(error);
    next(error);
  }
};