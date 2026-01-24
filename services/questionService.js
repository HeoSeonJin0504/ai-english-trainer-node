import { Question } from '../models/index.js';
import { NotFoundException } from '../utils/errors.js';
import { Op } from 'sequelize';

// 문제 저장
export const saveQuestion = async (userId, questionData) => {
  const {
    mode,
    toeicPart,
    writingType,
    topic,
    passage,
    insertSentence,
    question,
    options,
    answer,
    hint,
    explanation,
  } = questionData;

  const newQuestion = await Question.create({
    userId,
    mode,
    toeicPart: toeicPart || null,
    writingType: writingType || null,
    topic,
    passage: passage || null,
    insertSentence: insertSentence || null,
    question,
    options: options || null,
    answer,
    hint: hint || null,
    explanation: explanation || null,
  });

  return formatQuestionResponse(newQuestion);
};

// 내 문제 전체 조회(최신순)
export const getMyQuestions = async (userId) => {
  const questions = await Question.findAll({
    where: { userId },
    order: [['created_at', 'DESC']],
  });

  return questions.map(formatQuestionResponse);
};

// 모드별 문제 조회
export const getQuestionsByMode = async (userId, mode) => {
  const questions = await Question.findAll({
    where: { userId, mode },
    order: [['created_at', 'DESC']],
  });

  return questions.map(formatQuestionResponse);
};

// 토익 파트별 문제 조회
export const getToeicQuestionsByPart = async (userId, part) => {
  const questions = await Question.findAll({
    where: { userId, mode: 'TOEIC', toeicPart: part },
    order: [['created_at', 'DESC']],
  });

  return questions.map(formatQuestionResponse);
};

// 주제별 문제 검색
export const searchQuestions = async (userId, topic) => {
  const questions = await Question.findAll({
    where: {
      userId,
      topic: { [Op.like]: `%${topic}%` },
    },
    order: [['created_at', 'DESC']],
  });

  return questions.map(formatQuestionResponse);
};

// 문제 상세 조회
export const getQuestion = async (userId, questionId) => {
  const question = await Question.findOne({
    where: { id: questionId, userId },
  });

  if (!question) {
    throw new NotFoundException('문제를 찾을 수 없습니다.');
  }

  return formatQuestionResponse(question);
};

// 문제 삭제
export const deleteQuestion = async (userId, questionId) => {
  const question = await Question.findOne({
    where: { id: questionId, userId },
  });

  if (!question) {
    throw new NotFoundException('문제를 찾을 수 없습니다.');
  }

  await question.destroy();
};

// 문제 개수 조회
export const getQuestionCount = async (userId) => {
  return await Question.count({ where: { userId } });
};

// 모드별 문제 개수 조회
export const getQuestionCountByMode = async (userId, mode) => {
  return await Question.count({ where: { userId, mode } });
};

const formatQuestionResponse = (question) => ({
  id: question.id,
  mode: question.mode,
  toeicPart: question.toeicPart,
  writingType: question.writingType,
  topic: question.topic,
  passage: question.passage,
  insertSentence: question.insertSentence,
  question: question.question,
  options: question.options,
  answer: question.answer,
  hint: question.hint,
  explanation: question.explanation,
  createdAt: question.created_at,
});

export default {
  saveQuestion,
  getMyQuestions,
  getQuestionsByMode,
  getToeicQuestionsByPart,
  searchQuestions,
  getQuestion,
  deleteQuestion,
  getQuestionCount,
  getQuestionCountByMode,
};
