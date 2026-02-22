import { body, param, query, validationResult } from 'express-validator';
import ApiResponse from '../utils/ApiResponse.js';

// 유효성 검증 결과 처리 미들웨어
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMap = errors.array().reduce((acc, error) => {
      acc[error.path] = error.msg;
      return acc;
    }, {});
    return res.status(400).json(
      ApiResponse.error('입력값 검증에 실패했습니다.', errorMap)
    );
  }
  next();
};
 
// 회원가입 검증
export const signUpValidation = [
  body('username')
    .notEmpty().withMessage('아이디는 필수입니다.')
    .isLength({ min: 4, max: 50 }).withMessage('아이디는 4~50자 사이여야 합니다.')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('아이디는 영문, 숫자, 언더스코어만 가능합니다.'),
  body('password')
    .notEmpty().withMessage('비밀번호는 필수입니다.')
    .isLength({ min: 8, max: 100 }).withMessage('비밀번호는 8자 이상이어야 합니다.'),
  body('phone')
    .notEmpty().withMessage('핸드폰 번호는 필수입니다.')
    .matches(/^01[0-9]{8,9}$/).withMessage('올바른 핸드폰 번호 형식이 아닙니다.'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail().withMessage('올바른 이메일 형식이 아닙니다.'),
  body('gender')
    .notEmpty().withMessage('성별은 필수입니다.')
    .isIn(['MALE', 'FEMALE']).withMessage('성별은 MALE 또는 FEMALE만 가능합니다.'),
  body('age')
    .notEmpty().withMessage('나이는 필수입니다.')
    .isInt({ min: 1, max: 150 }).withMessage('올바른 나이를 입력해주세요.'),
  validate,
];

// 로그인 검증 
export const loginValidation = [
  body('username')
    .notEmpty().withMessage('아이디는 필수입니다.'),
  body('password')
    .notEmpty().withMessage('비밀번호는 필수입니다.'),
  validate,
];

// 단어 검증
export const wordValidation = [
  body('word')
    .notEmpty().withMessage('단어는 필수입니다.'),
  body('partOfSpeech')
    .notEmpty().withMessage('품사는 필수입니다.'),
  body('meaning')
    .notEmpty().withMessage('뜻은 필수입니다.'),
  validate,
];

// 예문 검증
export const exampleValidation = [
  body('english')
    .notEmpty().withMessage('영어 예문은 필수입니다.'),
  body('korean')
    .notEmpty().withMessage('한국어 번역은 필수입니다.'),
  validate,
];

// 문제 저장 검증
export const questionSaveValidation = [
  body('mode')
    .notEmpty().withMessage('문제 모드는 필수입니다.')
    .isIn(['TOEIC', 'WRITING']).withMessage('모드는 TOEIC 또는 WRITING만 가능합니다.'),
  body('topic')
    .notEmpty().withMessage('주제는 필수입니다.'),
  body('question')
    .notEmpty().withMessage('문제 내용은 필수입니다.'),
  body('answer')
    .notEmpty().withMessage('정답은 필수입니다.'),
  validate,
];

// 예문 생성 요청 검증
export const generateExampleValidation = [
  body('word')
    .notEmpty().withMessage('단어는 필수입니다.'),
  validate,
];

// 문제 생성 요청 검증
export const generateQuestionValidation = [
  body('topic')
    .notEmpty().withMessage('주제는 필수입니다.'),
  body('mode')
    .notEmpty().withMessage('모드는 필수입니다.')
    .matches(/^(toeic|writing)$/).withMessage('모드는 toeic 또는 writing만 가능합니다.'),
  validate,
];

// TTS 요청 검증
export const ttsValidation = [
  body('text')
    .notEmpty().withMessage('텍스트는 필수입니다.')
    .isLength({ max: 1000 }).withMessage('텍스트는 1000자 이하여야 합니다.'),
  validate,
];

export default {
  validate,
  signUpValidation,
  loginValidation,
  wordValidation,
  exampleValidation,
  questionSaveValidation,
  generateExampleValidation,
  generateQuestionValidation,
  ttsValidation,
};