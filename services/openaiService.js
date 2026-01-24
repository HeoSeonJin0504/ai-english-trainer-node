import openai, { OPENAI_MODEL } from '../config/openai.js';
import { BusinessException, BadRequestException } from '../utils/errors.js';

// 예문 생성
export const generateExamples = async (word) => {
  const prompt = buildExamplePrompt(word);

  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      {
        role: 'system',
        content: '당신은 영어 교육 전문가입니다. 학습자가 단어를 깊이 이해할 수 있도록 상세한 정보를 제공해주세요.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 800,
    temperature: 0.7,
  });

  const content = completion.choices[0].message.content;
  console.log('ChatGPT 응답:', content);

  return parseExampleResponse(content, word);
};

// 문제 생성
export const generateQuestions = async (topic, mode) => {
  const prompt = mode === 'toeic' 
    ? buildToeicPrompt(topic) 
    : buildWritingPrompt(topic);

  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      {
        role: 'system',
        content: '당신은 영어 시험 문제를 출제하는 전문가입니다.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 950,
    temperature: 0.7,
  });

  const content = completion.choices[0].message.content;
  console.log('ChatGPT 응답:', content);

  return parseQuestionResponse(content, mode);
};

// JSON 추출
const extractJson = (content) => {
  const match = content.match(/\{[\s\S]*\}/);
  if (match) {
    return match[0];
  }
  throw new BusinessException('JSON 형식 응답을 찾을 수 없습니다.', 500);
};

// 예문 응답 파싱
const parseExampleResponse = (content, word) => {
  try {
    const json = extractJson(content);
    const parsed = JSON.parse(json);

    // 유효하지 않은 단어인 경우
    if (parsed.isValid === false) {
      return {
        isValid: false,
        errorMessage: parsed.errorMessage || '유효한 영어 단어가 아닙니다.',
      };
    }

    return parsed;
  } catch (error) {
    console.error('예문 응답 파싱 실패:', error.message);
    throw new BusinessException('응답 파싱에 실패했습니다.', 500);
  }
};

// 문제 응답 파싱
const parseQuestionResponse = (content, mode) => {
  try {
    const json = extractJson(content);
    const parsed = JSON.parse(json);

    if (mode === 'toeic') {
      return {
        mode: 'toeic',
        questions: parsed.questions,
      };
    } else {
      return {
        mode: 'writing',
        writingQuestions: parsed.questions,
      };
    }
  } catch (error) {
    console.error('문제 응답 파싱 실패:', error.message);
    throw new BusinessException('응답 파싱에 실패했습니다.', 500);
  }
};

// 예문 생성 프롬프트
const buildExamplePrompt = (word) => {
  return `"${word}"가 유효한 영어 단어인지 먼저 확인하고, 학습 자료를 JSON 형식으로 만들어주세요.

⚠️ 반드시 아래 JSON 형식만 출력하세요. 다른 텍스트는 포함하지 마세요.

유효하지 않은 단어인 경우:
{
  "isValid": false,
  "errorMessage": "유효한 영어 단어가 아닙니다"
}

유효한 단어인 경우:
{
  "isValid": true,
  "word": {
    "original": "${word}",
    "meanings": [
      {
        "partOfSpeech": "품사 (예: 명사, 동사, 형용사)",
        "meaning": "한국어 뜻"
      }
    ]
  },
  "examples": [
    {
      "english": "영어 예문 (단어를 포함한 자연스러운 문장)",
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

📌 중요 규칙:
- meanings는 1~3개 제공
- examples는 정확히 3개 제공
- examples는 각각 초급, 중급, 고급 수준으로 작성
- synonym(유의어)는 반드시 제공
- antonym(반의어)는 가능한 한 제공하되, 정말로 적절한 반의어가 없으면 null
- JSON만 출력하고 다른 설명은 절대 포함하지 마세요`;
};

// 토익 문제 프롬프트
const buildToeicPrompt = (topic) => {
  return `당신은 토익(TOEIC) 문제를 전문적으로 출제하는 AI입니다.
반드시 아래 형식을 지키고, JSON만 출력하세요.

총 6개의 문제를 아래와 같이 출제하세요:

📌 Part 5 - 문법 빈칸 문제(2문항)
- 각 문장에 빈칸(____) 1개 포함
- 4지선다
- 해설(explanation)은 반드시 한국어로 작성

📌 Part 6 - 문장 삽입 문제(2문항)
- 반드시 passage에 [1], [2], [3], [4] 위치 표시 포함
- 예시: "첫번째 문장. [1] 두번째 문장. [2] 세번째 문장. [3] 네번째 문장. [4]"
- insertSentence: 삽입할 문장
- 정답은 A([1]), B([2]), C([3]), D([4]) 중 하나
- 해설(explanation)은 반드시 한국어로 작성

📌 Part 7 - 독해 문제(2문항)
- 짧은 지문 + 문제 + 4지선다
- 해설(explanation)은 반드시 한국어로 작성

⚠️ 반드시 JSON ONLY로 출력하세요.

{
  "mode": "toeic",
  "questions": {
    "part5": [
      {
        "question": "문장에 ____ 빈칸 포함",
        "options": { "A": "", "B": "", "C": "", "D": "" },
        "answer": "",
        "explanation": "한국어 해설"
      }
    ],
    "part6": [
      {
        "passage": "문장1. [1] 문장2. [2] 문장3. [3] 문장4. [4]",
        "insertSentence": "삽입할 문장",
        "question": "Where should the sentence be inserted?",
        "options": { "A": "[1]", "B": "[2]", "C": "[3]", "D": "[4]" },
        "answer": "B",
        "explanation": "한국어 해설"
      }
    ],
    "part7": [
      {
        "passage": "지문 내용",
        "question": "질문",
        "options": { "A": "", "B": "", "C": "", "D": "" },
        "answer": "",
        "explanation": "한국어 해설"
      }
    ]
  }
}

"${topic}"을 반영하여 자연스럽게 출제하세요.
Part 6의 passage에는 반드시 [1], [2], [3], [4] 위치 표시를 포함하세요!
출력은 반드시 JSON만 포함해야 하며, 그 외의 텍스트는 절대 포함하지 마세요.`;
};

// 영작 문제 프롬프트
const buildWritingPrompt = (topic) => {
  return `당신은 영어 학습자를 위한 영작 연습 문제를 만드는 전문가입니다.
"${topic}"을 기반으로 총 4개의 영작 문제를 만들어주세요.

문제 유형(랜덤 배정):
1) 상황 설명 기반 영작
2) 한→영 번역
3) 문장 자연스럽게 고치기
4) 짧은 답변식 영작

⚠️ JSON ONLY로 출력하세요:

{
  "mode": "writing",
  "questions": [
    {
      "type": "situation | translation | fix | short-answer",
      "question": "문제 설명 (한국어)",
      "hint": "필요하면 간단한 힌트",
      "answer": "모범답안(영어)"
    }
  ]
}
JSON 이외의 텍스트는 절대 포함하지 마세요.`;
};

export default {
  generateExamples,
  generateQuestions,
};