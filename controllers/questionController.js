import questionService from '../services/questionService.js';
import { getCurrentUserId } from '../middleware/authMiddleware.js';
import ApiResponse from '../utils/ApiResponse.js';

// 문제 저장,  POST /api/questions
export const saveQuestion = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const questionData = req.body;
    const question = await questionService.saveQuestion(userId, questionData);
    
    res.status(201).json(
      ApiResponse.success(question, '문제가 저장되었습니다.')
    );
  } catch (error) {
    next(error);
  }
};

// 내 문제 전체 조회, GET /api/questions
export const getMyQuestions = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const questions = await questionService.getMyQuestions(userId);
    
    res.json(ApiResponse.success(questions));
  } catch (error) {
    next(error);
  }
};

// 토익 문제 조회, GET /api/questions/toeic
export const getToeicQuestions = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const questions = await questionService.getQuestionsByMode(userId, 'TOEIC');
    
    res.json(ApiResponse.success(questions));
  } catch (error) {
    next(error);
  }
};

// 토익 파트별 문제 조회, GET /api/questions/toeic/:part
export const getToeicQuestionsByPart = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { part } = req.params;
    const questions = await questionService.getToeicQuestionsByPart(userId, part.toUpperCase());
    
    res.json(ApiResponse.success(questions));
  } catch (error) {
    next(error);
  }
};

// 영작 문제 조회, GET /api/questions/writing
export const getWritingQuestions = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const questions = await questionService.getQuestionsByMode(userId, 'WRITING');
    
    res.json(ApiResponse.success(questions));
  } catch (error) {
    next(error);
  }
};

// 주제별 문제 검색, GET /api/questions/search?topic=xxx
export const searchQuestions = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { topic } = req.query;
    const questions = await questionService.searchQuestions(userId, topic);
    
    res.json(ApiResponse.success(questions));
  } catch (error) {
    next(error);
  }
};

// 문제 상세 조회, GET /api/questions/:questionId
export const getQuestion = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { questionId } = req.params;
    const question = await questionService.getQuestion(userId, parseInt(questionId));
    
    res.json(ApiResponse.success(question));
  } catch (error) {
    next(error);
  }
};

// 문제 삭제, DELETE /api/questions/:questionId
export const deleteQuestion = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { questionId } = req.params;
    await questionService.deleteQuestion(userId, parseInt(questionId));
    
    res.json(ApiResponse.successMessage('문제가 삭제되었습니다.'));
  } catch (error) {
    next(error);
  }
};

// 문제 개수 조회, GET /api/questions/count
export const getQuestionCount = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const count = await questionService.getQuestionCount(userId);
    
    res.json(ApiResponse.success(count));
  } catch (error) {
    next(error);
  }
};

// 토익 문제 개수 조회, GET /api/questions/toeic/count
export const getToeicQuestionCount = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const count = await questionService.getQuestionCountByMode(userId, 'TOEIC');
    
    res.json(ApiResponse.success(count));
  } catch (error) {
    next(error);
  }
};

// 영작 문제 개수 조회, GET /api/questions/writing/count
export const getWritingQuestionCount = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const count = await questionService.getQuestionCountByMode(userId, 'WRITING');
    
    res.json(ApiResponse.success(count));
  } catch (error) {
    next(error);
  }
};

export default {
  saveQuestion,
  getMyQuestions,
  getToeicQuestions,
  getToeicQuestionsByPart,
  getWritingQuestions,
  searchQuestions,
  getQuestion,
  deleteQuestion,
  getQuestionCount,
  getToeicQuestionCount,
  getWritingQuestionCount,
};
