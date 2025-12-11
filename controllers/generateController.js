import openai from "../config/openai.js";

// 예문 생성
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

(중략 — 원문 그대로 유지)
`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON 형식 응답을 찾을 수 없습니다");

    const parsed = JSON.parse(jsonMatch[0]);

    if (parsed.isValid === false) {
      return res.status(400).json({
        error: "Invalid word",
        message: parsed.errorMessage,
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
📌 Part 5 – 문법 빈칸 문제(2문항)
- 각 문장에 빈칸(____) 1개 포함
- 4지선다
- topic을 반영한 자연스러운 문장
- 간단한 해설(explanation)은 반드시 한국어로 작성

📌 Part 6 – 문장 삽입 문제(2문항)
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

📌 Part 7 – 독해 문제(2문항)
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
