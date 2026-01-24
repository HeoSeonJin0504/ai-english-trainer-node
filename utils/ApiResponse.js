class ApiResponse {
  constructor(success, message, data = null) {
    this.success = success;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
  }

  static success(data, message = "요청이 성공적으로 처리되었습니다.") {
    return new ApiResponse(true, message, data);
  }

  static successMessage(message) {
    return new ApiResponse(true, message);
  }

  // 실패 응답
  static error(message, data = null) {
    return new ApiResponse(false, message, data);
  }
}

export default ApiResponse;
