import { Example, Word } from '../models/index.js';
import { DuplicateException, NotFoundException } from '../utils/errors.js';
import { Op } from 'sequelize';

// 예문 저장
export const saveExample = async (userId, exampleData) => {
  const { english, korean, wordId } = exampleData;

  // 중복 확인
  const existing = await Example.findOne({
    where: { userId, english },
  });
  if (existing) {
    throw new DuplicateException('이미 저장된 예문입니다.');
  }

  // 연결할 단어 확인 (선택)
  if (wordId) {
    const word = await Word.findOne({
      where: { id: wordId, userId },
    });
    if (!word) {
      throw new NotFoundException('단어를 찾을 수 없습니다.');
    }
  }

  // 예문 생성
  const example = await Example.create({
    userId,
    wordId: wordId || null,
    english,
    korean,
  });

  return await getExampleWithWord(example.id, userId);
};

//내 예문 전체 조회 (최신순)
export const getMyExamples = async (userId) => {
  const examples = await Example.findAll({
    where: { userId },
    include: [{
      model: Word,
      as: 'word',
      attributes: ['id', 'word', 'partOfSpeech', 'meaning'],
    }],
    order: [['created_at', 'DESC']],
  });

  return examples.map(formatExampleResponse);
};

// 특정 단어의 예문 조회
export const getExamplesByWord = async (userId, wordId) => {
  const examples = await Example.findAll({
    where: { userId, wordId },
    include: [{
      model: Word,
      as: 'word',
      attributes: ['id', 'word', 'partOfSpeech', 'meaning'],
    }],
    order: [['created_at', 'DESC']],
  });

  return examples.map(formatExampleResponse);
};

// 예문 검색
export const searchExamples = async (userId, keyword) => {
  const examples = await Example.findAll({
    where: {
      userId,
      english: { [Op.like]: `%${keyword}%` },
    },
    include: [{
      model: Word,
      as: 'word',
      attributes: ['id', 'word', 'partOfSpeech', 'meaning'],
    }],
    order: [['created_at', 'DESC']],
  });

  return examples.map(formatExampleResponse);
};

// 예문 상세 조회
export const getExample = async (userId, exampleId) => {
  const example = await Example.findOne({
    where: { id: exampleId, userId },
    include: [{
      model: Word,
      as: 'word',
      attributes: ['id', 'word', 'partOfSpeech', 'meaning'],
    }],
  });

  if (!example) {
    throw new NotFoundException('예문을 찾을 수 없습니다.');
  }

  return formatExampleResponse(example);
};

// 예문 삭제
export const deleteExample = async (userId, exampleId) => {
  const example = await Example.findOne({
    where: { id: exampleId, userId },
  });

  if (!example) {
    throw new NotFoundException('예문을 찾을 수 없습니다.');
  }

  await example.destroy();
};

// 예문 개수 조회
export const getExampleCount = async (userId) => {
  return await Example.count({ where: { userId } });
};

// 헬퍼: 단어 포함 예문 조회
const getExampleWithWord = async (exampleId, userId) => {
  const example = await Example.findOne({
    where: { id: exampleId, userId },
    include: [{
      model: Word,
      as: 'word',
      attributes: ['id', 'word', 'partOfSpeech', 'meaning'],
    }],
  });

  return formatExampleResponse(example);
};

const formatExampleResponse = (example) => ({
  id: example.id,
  english: example.english,
  korean: example.korean,
  word: example.word ? {
    id: example.word.id,
    word: example.word.word,
    partOfSpeech: example.word.partOfSpeech,
    meaning: example.word.meaning,
  } : null,
  createdAt: example.created_at,
});

export default {
  saveExample,
  getMyExamples,
  getExamplesByWord,
  searchExamples,
  getExample,
  deleteExample,
  getExampleCount,
};
