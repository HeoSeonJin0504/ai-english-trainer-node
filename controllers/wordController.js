import wordService from '../services/wordService.js';
import { getCurrentUserId } from '../middleware/authMiddleware.js';
import ApiResponse from '../utils/ApiResponse.js';

// 단어 저장, POST /api/words
export const saveWord = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const wordData = req.body;
    const word = await wordService.saveWord(userId, wordData);
    
    res.status(201).json(
      ApiResponse.success(word, '단어가 저장되었습니다.')
    );
  } catch (error) {
    next(error);
  }
};

// 내 단어 전체 조회, GET /api/words
export const getMyWords = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const words = await wordService.getMyWords(userId);
    
    res.json(ApiResponse.success(words));
  } catch (error) {
    next(error);
  }
};

// 단어 검색, GET /api/words/search?keyword=xxx
export const searchWords = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { keyword } = req.query;
    const words = await wordService.searchWords(userId, keyword);
    
    res.json(ApiResponse.success(words));
  } catch (error) {
    next(error);
  }
};

// 단어 상세 조회, GET /api/words/:wordId
export const getWord = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { wordId } = req.params;
    const word = await wordService.getWord(userId, parseInt(wordId));
    
    res.json(ApiResponse.success(word));
  } catch (error) {
    next(error);
  }
};

// 단어 삭제, DELETE /api/words/:wordId
export const deleteWord = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { wordId } = req.params;
    await wordService.deleteWord(userId, parseInt(wordId));
    
    res.json(ApiResponse.successMessage('단어가 삭제되었습니다.'));
  } catch (error) {
    next(error);
  }
};

// 단어 개수 조회, GET /api/words/count
export const getWordCount = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const count = await wordService.getWordCount(userId);
    
    res.json(ApiResponse.success(count));
  } catch (error) {
    next(error);
  }
};

export default {
  saveWord,
  getMyWords,
  searchWords,
  getWord,
  deleteWord,
  getWordCount,
};
