import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'words.json');

// 데이터 파일 읽기
const readData = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { words: [] };
  }
};

// 데이터 파일 쓰기
const writeData = async (data) => {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
};

// 모든 단어 가져오기
export const getWords = async (req, res, next) => {
  try {
    const data = await readData();
    res.json(data.words);
  } catch (error) {
    next(error);
  }
};

// 단어 추가
export const addWord = async (req, res, next) => {
  try {
    const { word, partOfSpeech, examples } = req.body;

    // 유효성 검사
    if (!word) {
      return res.status(400).json({ error: 'Word is required' });
    }

    if (!partOfSpeech || (Array.isArray(partOfSpeech) && partOfSpeech.length === 0)) {
      return res.status(400).json({ error: 'Part of speech is required' });
    }

    const data = await readData();
    
    // 새 단어 객체 생성
    const newWord = {
      id: Date.now().toString(),
      word,
      partOfSpeech: Array.isArray(partOfSpeech) ? partOfSpeech : [partOfSpeech], // 배열로 저장
      examples: examples || [], // [{ english: "...", korean: "..." }] 형태
      createdAt: new Date().toISOString(),
    };

    data.words.push(newWord);
    await writeData(data);

    res.status(201).json(newWord);
  } catch (error) {
    next(error);
  }
};

// 단어 수정 (선택적 - 나중에 필요할 수 있음)
export const updateWord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { word, partOfSpeech, examples } = req.body;
    
    const data = await readData();
    const wordIndex = data.words.findIndex(w => w.id === id);

    if (wordIndex === -1) {
      return res.status(404).json({ error: 'Word not found' });
    }

    // 기존 데이터 유지하면서 업데이트
    if (word) data.words[wordIndex].word = word;
    if (partOfSpeech) {
      data.words[wordIndex].partOfSpeech = Array.isArray(partOfSpeech) 
        ? partOfSpeech 
        : [partOfSpeech];
    }
    if (examples) data.words[wordIndex].examples = examples;
    
    data.words[wordIndex].updatedAt = new Date().toISOString();

    await writeData(data);
    res.json(data.words[wordIndex]);
  } catch (error) {
    next(error);
  }
};

// 단어 삭제
export const deleteWord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await readData();

    const initialLength = data.words.length;
    data.words = data.words.filter(w => w.id !== id);

    if (data.words.length === initialLength) {
      return res.status(404).json({ error: 'Word not found' });
    }

    await writeData(data);
    res.json({ message: 'Word deleted successfully' });
  } catch (error) {
    next(error);
  }
};