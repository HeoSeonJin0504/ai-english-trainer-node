import openaiService from '../services/openaiService.js';
import ApiResponse from '../utils/ApiResponse.js';

// 예문 생성, POST /api/generate/examples
export const generateExamples = async (req, res, next) => {
  try {
    const { word } = req.body;
    console.log('=== 예문 생성 요청 ===');
    console.log('단어:', word);

    const result = await openaiService.generateExamples(word);

    // 유효하지 않은 단어인 경우
    if (!result.isValid) {
      return res.status(400).json(
        ApiResponse.error(result.errorMessage || '유효한 영어 단어가 아닙니다.')
      );
    }

    res.json(ApiResponse.success(result));
  } catch (error) {
    console.error('=== 예문 생성 에러 ===');
    console.error(error);
    next(error);
  }
};

// 문제 생성, POST /api/generate/questions
export const generateQuestions = async (req, res, next) => {
  try {
    const { topic, mode } = req.body;
    console.log('=== 문제 생성 요청 ===');
    console.log('주제:', topic);
    console.log('모드:', mode);

    const result = await openaiService.generateQuestions(topic, mode);

    res.json(ApiResponse.success(result));
  } catch (error) {
    console.error('=== 문제 생성 에러 ===');
    console.error(error);
    next(error);
  }
};

export default {
  generateExamples,
  generateQuestions,
};