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
          content: 'You are an English teacher. Generate example sentences with Korean translations.',
        },
        {
          role: 'user',
          content: `
Generate 5 example sentences using the word "${word}". 
For each item, return both the English sentence and its Korean translation.

Format:
1. English: ...
   Korean: ...
2. English: ...
   Korean: ...
(continue until 5)

Return exactly 5 items.
          `,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    console.log('=== GPT API 전체 응답 ===');
    console.log(JSON.stringify(completion, null, 2));

    const content = completion.choices[0].message.content;
    console.log('=== 생성된 원본 내용 ===');
    console.log(content);

    // 줄단위로 나누고 불필요한 빈 줄 제거
    const examples = content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());

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
          content: 'You are an English teacher creating quiz questions.',
        },
        {
          role: 'user',
          content: `
Create 5 multiple choice questions about "${topic}".

For each question, return the following structure:

Question: (English)
Translation: (Korean)
A) ...
B) ...
C) ...
D) ...
Answer: X

Return exactly 5 questions.
Separate each question with one blank line.
          `,
        },
      ],
      max_tokens: 350,
      temperature: 0.7,
    });

    console.log('=== GPT API 전체 응답 ===');
    console.log(JSON.stringify(completion, null, 2));

    const content = completion.choices[0].message.content;
    console.log('=== 생성된 원본 내용 ===');
    console.log(content);

    // 문제는 두 줄 공백 기준으로 split
    const questions = content
      .split('\n\n')
      .filter(q => q.trim());

    console.log('=== 파싱된 문제 배열 ===');
    console.log(questions);

    res.json({ topic, questions });
  } catch (error) {
    console.error('=== 문제 생성 에러 ===');
    console.error(error);
    next(error);
  }
};
