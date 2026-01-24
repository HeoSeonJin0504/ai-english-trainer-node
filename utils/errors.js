// 비즈니스 예외 클래스
export class BusinessException extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'BusinessException';
    this.statusCode = statusCode;
  }
}

// 중복 예외 클래스
export class DuplicateException extends BusinessException {
  constructor(message) {
    super(message, 409);
    this.name = 'DuplicateException';
  }
}

// 인증 예외 클래스
export class UnauthorizedException extends BusinessException {
  constructor(message = '로그인이 필요합니다.') {
    super(message, 401);
    this.name = 'UnauthorizedException';
  }
}

// 리소스 없음 클래스
export class NotFoundException extends BusinessException {
  constructor(message = '리소스를 찾을 수 없습니다.') {
    super(message, 404);
    this.name = 'NotFoundException';
  }
}

// 잘못된 요청 예외 클래스
export class BadRequestException extends BusinessException {
  constructor(message = '잘못된 요청입니다.') {
    super(message, 400);
    this.name = 'BadRequestException';
  }
}

export default {
  BusinessException,
  DuplicateException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
};
