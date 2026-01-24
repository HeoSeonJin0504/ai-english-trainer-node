import exampleService from '../services/exampleService.js';
import { getCurrentUserId } from '../middleware/authMiddleware.js';
import ApiResponse from '../utils/ApiResponse.js';

// 예문 저장. POST /api/examples
export const saveExample = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const exampleData = req.body;
    const example = await exampleService.saveExample(userId, exampleData);
    
    res.status(201).json(
      ApiResponse.success(example, '예문이 저장되었습니다.')
    );
  } catch (error) {
    next(error);
  }
};

// 내 예문 전체 조회, GET /api/examples
export const getMyExamples = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const examples = await exampleService.getMyExamples(userId);
    
    res.json(ApiResponse.success(examples));
  } catch (error) {
    next(error);
  }
};

// 특정 단어의 예문 조회, GET /api/examples/word/:wordId
export const getExamplesByWord = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { wordId } = req.params;
    const examples = await exampleService.getExamplesByWord(userId, parseInt(wordId));
    
    res.json(ApiResponse.success(examples));
  } catch (error) {
    next(error);
  }
};

// GET /api/examples/search?keyword=xxx
export const searchExamples = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { keyword } = req.query;
    const examples = await exampleService.searchExamples(userId, keyword);
    
    res.json(ApiResponse.success(examples));
  } catch (error) {
    next(error);
  }
};

// 예문 상세 조회, GET /api/examples/:exampleId
export const getExample = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { exampleId } = req.params;
    const example = await exampleService.getExample(userId, parseInt(exampleId));
    
    res.json(ApiResponse.success(example));
  } catch (error) {
    next(error);
  }
};

// DELETE, /api/examples/:exampleId
export const deleteExample = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { exampleId } = req.params;
    await exampleService.deleteExample(userId, parseInt(exampleId));
    
    res.json(ApiResponse.successMessage('예문이 삭제되었습니다.'));
  } catch (error) {
    next(error);
  }
};

// 예문 개수 조회, GET /api/examples/count
export const getExampleCount = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const count = await exampleService.getExampleCount(userId);
    
    res.json(ApiResponse.success(count));
  } catch (error) {
    next(error);
  }
};

export default {
  saveExample,
  getMyExamples,
  getExamplesByWord,
  searchExamples,
  getExample,
  deleteExample,
  getExampleCount,
};
