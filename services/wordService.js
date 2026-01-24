import { Word, User } from '../models/index.js';
import { DuplicateException, NotFoundException } from '../utils/errors.js';
import { Op } from 'sequelize';

// 단어 저장
export const saveWord = async (userId, wordData) => {
  const { word, partOfSpeech, meaning } = wordData;

  // 중복 확인 (같은 단어 + 같은 품사)
  const existing = await Word.findOne({
    where: { userId, word, partOfSpeech },
  });
  if (existing) {
    throw new DuplicateException(`이미 저장된 단어입니다: ${word} (${partOfSpeech})`);
  }

  // 단어 생성
  const newWord = await Word.create({
    userId,
    word,
    partOfSpeech,
    meaning,
  });

  return formatWordResponse(newWord);
};

// 단어 전체 조회(최신순)
export const getMyWords = async (userId) => {
  const words = await Word.findAll({
    where: { userId },
    order: [['created_at', 'DESC']],
  });

  return words.map(formatWordResponse);
};

// 단어 검색
export const searchWords = async (userId, keyword) => {
  const words = await Word.findAll({
    where: {
      userId,
      word: { [Op.like]: `%${keyword}%` },
    },
    order: [['created_at', 'DESC']],
  });

  return words.map(formatWordResponse);
};

// 단어 상세 조회
export const getWord = async (userId, wordId) => {
  const word = await Word.findOne({
    where: { id: wordId, userId },
  });

  if (!word) {
    throw new NotFoundException('단어를 찾을 수 없습니다.');
  }

  return formatWordResponse(word);
};

// 단어 삭제
export const deleteWord = async (userId, wordId) => {
  const word = await Word.findOne({
    where: { id: wordId, userId },
  });

  if (!word) {
    throw new NotFoundException('단어를 찾을 수 없습니다.');
  }

  await word.destroy();
};

// 단어 개수 조회
export const getWordCount = async (userId) => {
  return await Word.count({ where: { userId } });
};

const formatWordResponse = (word) => ({
  id: word.id,
  word: word.word,
  partOfSpeech: word.partOfSpeech,
  meaning: word.meaning,
  createdAt: word.created_at,
});

export default {
  saveWord,
  getMyWords,
  searchWords,
  getWord,
  deleteWord,
  getWordCount,
};
