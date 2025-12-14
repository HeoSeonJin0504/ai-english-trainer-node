import openai from "../config/openai.js";

export const generateExamples = async (req, res, next) => {
  try {
    const { word } = req.body;
    if (!word) {
      return res.status(400).json({ error: "Word is required" });
    }
    console.log("=== 예문 생성 요청 ===");
    console.log("단어:", word);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `당신은 영어 교육 전문가입니다. 학습자가 단어를 깊이 이해할 수 있도록 상세한 정보를 제공해주세요.`,
        },
        {
          role: "user",
          content: `"${word}"가 유효한 영어 단어인지 먼저 확인하고, 학습 자료를 JSON 형식으로 만들어주세요.

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
- 각 예문은 단어의 다양한 용법을 보여줘야 함
- synonym(유의어)는 반드시 제공
- antonym(반의어)는 가능한 한 제공하되, 정말로 적절한 반의어가 존재하지 않는 경우에만 null 사용
  * 예: happy → sad (O)
  * 예: big → small (O)
  * 예: good → bad (O)
  * 예: hot → cold (O)
  * 예: beautiful → ugly (O)
  * 예: love(동사) → hate (O)
  * 예: increase → decrease (O)
  * 예: book(명사) → null (정말 반의어가 없는 경우)
  * 예: table(명사) → null (정말 반의어가 없는 경우)
- 형용사, 동사, 부사는 대부분 반의어가 존재하므로 반드시 찾아서 제공
- 명사의 경우에도 가능하면 반의어 제공 (예: success ↔ failure, friend ↔ enemy)
- JSON만 출력하고 다른 설명은 절대 포함하지 마세요

예시 1 (반의어 있음):
{
  "isValid": true,
  "word": {
    "original": "happy",
    "meanings": [
      { "partOfSpeech": "형용사", "meaning": "행복한, 기쁜" }
    ]
  },
  "examples": [
    { "english": "I am happy to see you.", "korean": "당신을 만나서 기쁩니다." }
  ],
  "relatedWords": {
    "synonym": { "word": "joyful", "partOfSpeech": "형용사", "meaning": "즐거운" },
    "antonym": { "word": "sad", "partOfSpeech": "형용사", "meaning": "슬픈" }
  }
}

예시 2 (반의어 없음):
{
  "isValid": true,
  "word": {
    "original": "book",
    "meanings": [
      { "partOfSpeech": "명사", "meaning": "책" }
    ]
  },
  "examples": [
    { "english": "I read a book every day.", "korean": "나는 매일 책을 읽는다." }
  ],
  "relatedWords": {
    "synonym": { "word": "publication", "partOfSpeech": "명사", "meaning": "출판물" },
    "antonym": null
  }
}
`,
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });
    const content = completion.choices[0].message.content;
    console.log("GPT 응답:", content);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("JSON을 찾을 수 없음:", content);
      throw new Error("JSON 형식 응답을 찾을 수 없습니다");
    }
    const parsed = JSON.parse(jsonMatch[0]);
    console.log("파싱된 데이터:", JSON.stringify(parsed, null, 2));
    if (parsed.isValid === false) {
      return res.status(400).json({
        error: "Invalid word",
        message: parsed.errorMessage || "유효한 영어 단어가 아닙니다",
        word: word,
      });
    }
    res.json(parsed);
  } catch (error) {
    console.error("=== 예문 생성 에러 ===");
    console.error(error);
    next(error);
  }
};

// 문제 생성
export const generateQuestions = async (req, res, next) => {
  try {
    const { topic, mode } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }
    if (!mode) {
      return res
        .status(400)
        .json({ error: "Mode is required (toeic | writing)" });
    }

    console.log("=== 문제 생성 요청 ===");
    console.log("주제:", topic);
    console.log("모드:", mode);

    // 토익모드
    const toeicPrompt = `
당신은 토익(TOEIC) 문제를 전문적으로 출제하는 능력을 가진 AI입니다.
반드시 아래 형식을 지키고, JSON만 출력하세요.

총 6개의 문제를 아래와 같이 출제하세요:

========================================
📌 Part 5 - 문법 빈칸 문제(2문항)
- 각 문장에 빈칸(____) 1개 포함
- 4지선다
- topic을 반영한 자연스러운 문장
- 간단한 해설(explanation)은 반드시 한국어로 작성

📌 Part 6 - 문장 삽입 문제(2문항)
- 짧은 패시지 1개당 1문항
- 패시지는 [1], [2], [3], [4] 위치가 표시된 4문장으로 구성
- 선택지는 A~D의 문장 후보 4개
- A~D 중 어디에 삽입해야 하는지 선택
- 해설(explanation)은 반드시 한국어로 작성

(예시 구조)
passage: "문장A [1] 문장B [2] 문장C [3] 문장D [4]"
question: "Where should the sentence be inserted?"
insertSentence: "삽입해야 할 문장"
options: { "A": "[1]", "B": "[2]", "C": "[3]", "D": "[4]" }
answer: "B"

📌 Part 7 - 독해 문제(2문항)
- 짧은 지문 + 문제 + 4지선다
- topic 반영
- 해설(explanation)은 반드시 한국어로 작성
========================================

⚠️ 반드시 JSON ONLY로 출력하세요.

{
  "mode": "toeic",
  "questions": {
    "part5": [
      {
        "question": "",
        "options": { "A": "", "B": "", "C": "", "D": "" },
        "answer": "",
        "explanation": ""  // 한국어로 작성
      }
    ],
    "part6": [
      {
        "passage": "",
        "insertSentence": "",
        "question": "Where should the sentence be inserted?",
        "options": { "A": "[1]", "B": "[2]", "C": "[3]", "D": "[4]" },
        "answer": "",
        "explanation": ""  // 한국어로 작성
      }
    ],
    "part7": [
      {
        "passage": "",
        "question": "",
        "options": { "A": "", "B": "", "C": "", "D": "" },
        "answer": "",
        "explanation": ""  // 한국어로 작성
      }
    ]
  }
}

"${topic}"을 반영하여 자연스럽게 출제하세요.
출력은 반드시 JSON만 포함해야 하며, 그 외의 텍스트는 절대 포함하지 마세요.
    `;

    // 영작모드
    const writingPrompt = `
당신은 영어 학습자를 위한 영작 연습 문제를 만드는 전문가입니다.
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
JSON 이외의 텍스트는 절대 포함하지 마세요.
    `;

    // GPT 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 영어 시험 문제를 출제하는 전문가입니다.",
        },
        {
          role: "user",
          content: mode === "toeic" ? toeicPrompt : writingPrompt,
        },
      ],
      max_tokens: 950,
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON 형식 응답이 아닙니다.");

    const parsed = JSON.parse(jsonMatch[0]);

    res.json(parsed);
  } catch (error) {
    console.error("=== 문제 생성 에러 ===");
    console.error(error);
    next(error);
  }
};
