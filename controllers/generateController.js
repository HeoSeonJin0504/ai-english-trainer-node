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
아래 구성으로 총 6개의 문제를 JSON으로 생성하세요.

📌 Part 5 – 문법 빈칸 2문항
  - 문장 1개당 빈칸 1개
  - 4지선다
  - 중급 난이도

📌 Part 6 – 문장 위치 선택 문제 2문항
  - 간단한 패시지 1개
  - 문장 4개 중 어디에 들어갈지 고르는 문제
  - 보기: A / B / C / D

📌 Part 7 – 독해 문제 2문항
  - 짧은 지문 + 질문 1개씩

⚠️ 응답 형식(JSON ONLY):

{
  "mode": "toeic",
  "questions": {
    "part5": [
      {
        "question": "문장 (빈칸 포함)",
        "options": { "A": "", "B": "", "C": "", "D": "" },
        "answer": "A"
      }
    ],
    "part6": [
      {
        "passage": "짧은 패시지...",
        "question": "어느 위치에 넣어야 할까?",
        "options": { "A": "문장1", "B": "문장2", "C": "문장3", "D": "문장4" },
        "answer": "C"
      }
    ],
    "part7": [
      {
        "passage": "짧은 독해 지문...",
        "question": "질문",
        "options": { "A": "", "B": "", "C": "", "D": "" },
        "answer": "B"
      }
    ]
  }
}

"${topic}"을 반영하여 출제하세요.
다른 텍스트 없이 JSON만 출력하세요.
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
      max_tokens: 600,
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
