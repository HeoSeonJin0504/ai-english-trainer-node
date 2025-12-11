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
          content: `"${word}" 단어에 대한 학습 자료를 만들어주세요.

📌 포함할 내용:

1. 입력한 단어 분석
   - 품사 (명사, 동사, 형용사, 부사 등)
   - 가장 일반적인 한국어 뜻 (간결하게)

2. 실용 예문 3개
   - 실생활에서 자주 쓰이는 자연스러운 문장
   - 다양한 상황과 맥락 (일상, 업무, 학습 등)
   - 각 예문은 초급, 중급, 고급 수준의 난이도로 각각 구분
   - 각 예문마다 정확한 한국어 번역

3. 관련 단어
   - 유의어 1개: 비슷한 의미의 단어 (품사, 뜻 포함)
   - 반의어 1개: 반대 의미의 단어 (품사, 뜻 포함)
   - 만약 반의어가 없는 단어라면 null로 표시

아래 JSON 형식으로만 응답하세요:
{
  "word": {
    "original": "${word}",
    "partOfSpeech": "품사 (ex: 명사, 동사, 형용사, 부사)",
    "meaning": "한국어 뜻"
  },
  "examples": [
    {
      "english": "영어 예문",
      "korean": "한국어 번역"
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

⚠️ 주의사항:
- 반드시 위 JSON 형식만 사용하고 다른 설명은 추가하지 마세요
- examples 배열에는 정확히 3개의 예문만 포함
- 품사는 한국어로 명확하게 표기
- 반의어가 없으면 antonym을 null로 설정`,
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

    // 데이터 검증
    if (!parsed.word || !parsed.examples || !Array.isArray(parsed.examples)) {
      throw new Error('응답 형식이 올바르지 않습니다');
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