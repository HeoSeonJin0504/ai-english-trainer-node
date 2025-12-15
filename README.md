# AI English Trainer (Node.JS)

AI English Trainer는 OpenAI GPT와 Google Cloud TTS를 활용한 **영어 학습 플랫폼**입니다.

## 📌 프로젝트 개요

사용자가 입력한 영어 단어를 기반으로 AI가 자동으로 예문, 품사, 의미, 유의어/반의어를 생성하고, 
토익(TOEIC) 문제 또는 영작 문제를 자동 출제하는 학습 시스템입니다.
Google Cloud TTS를 통해 생성된 텍스트를 음성으로 들을 수도 있습니다.

### 주요 기능

- **단어 학습**: 단어 추가, 조회, 삭제 및 예문/의미/유의어/반의어 자동 생성
- **예문 생성**: OpenAI GPT-4o-mini를 활용한 영어 예문 자동 생성
- **문제 생성**: 토익(Part 5/6/7) 및 영작 문제 자동 출제
- **음성 변환(TTS)**: Google Cloud TTS를 사용한 텍스트 음성 변환
- **단어 관리**: 로컬 JSON 파일 기반 단어 저장 및 관리

## 🛠️ 기술 스택

### Core
- **Node.js** (v16+) - 서버 런타임
- **Express** (v5.2.1) - 웹 프레임워크

### AI & Services
- **OpenAI API** (v6.10.0) - GPT-4o-mini를 활용한 예문/문제 생성
- **Google Cloud Text-to-Speech** (v6.4.0) - 영어 음성 합성

### Middleware & Utilities
- **cors** (v2.8.5) - Cross-Origin Resource Sharing 처리
- **dotenv** (v17.2.3) - 환경 변수 관리

### Development
- **nodemon** (v3.1.11) - 개발 서버 자동 재시작

## 📁 프로젝트 구조

```
ai-english-trainer-node/
├── config/                  # 설정 파일
│   ├── openai.js           # OpenAI API 클라이언트 설정
│   └── googleTTS.js        # Google TTS 클라이언트 설정
├── controllers/             # 요청 처리 로직
│   ├── generateController.js    # 예문/문제 생성 컨트롤러
│   ├── wordsController.js       # 단어 관리 컨트롤러
│   └── ttsController.js         # TTS 컨트롤러
├── routes/                  # API 라우트 정의
│   ├── generateRoutes.js        # 예문/문제 생성 라우트
│   ├── wordsRoutes.js           # 단어 관리 라우트
│   └── ttsRoutes.js             # TTS 라우트
├── middleware/              # 미들웨어
│   └── errorHandler.js          # 전역 에러 핸들러
├── data/                    # 데이터 저장소
│   └── words.json              # 단어 저장 파일
├── .env                     # 환경 변수
├── app.js                   # Express 앱 초기화 및 설정
└── package.json             # 프로젝트 의존성
```

## 🔌 API 엔드포인트

### 예문 및 문제 생성 (Generate)

#### `POST /api/generate/examples`
단어에 대한 예문, 품사, 의미, 유의어/반의어 생성

#### `POST /api/generate/questions`
토익 또는 영작 문제 생성

### 단어 관리 (Words)

#### `GET /api/words`
저장된 모든 단어 조회

#### `POST /api/words`
새 단어 추가

### 음성 변환 (TTS)

#### `POST /api/tts/speak`
텍스트를 음성으로 변환 (Google TTS)

#### `GET /api/tts/status`
TTS 서비스 상태 확인

## 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 설정하세요:

```env
# 서버 포트
PORT=3000

# OpenAI API 설정
OPENAI_API_KEY=your_openai_api_key_here

# 환경 설정
NODE_ENV=development

# Google Cloud TTS 설정
GOOGLE_APPLICATION_CREDENTIALS=./config/google-credentials.json
```

### Google Cloud TTS 설정 방법

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. Text-to-Speech API 활성화
3. 서비스 계정 생성 및 JSON 키 다운로드
4. `config/google-credentials.json`에 키 파일 저장
5. 환경 변수에 경로 설정

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd ai-english-trainer-node
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 위의 환경 변수를 설정합니다.

### 4. 서버 실행

**개발 모드 (nodemon)**
```bash
npm run dev
```

**프로덕션 모드**
```bash
npm start
```

서버가 정상적으로 실행되면 다음과 같은 메시지가 표시됩니다:
```
서버가 3000 포트에서 열리고 있습니다.
```

## 📊 데이터 구조

### 단어 저장 형식 (words.json)
```json
{
  "words": [
    {
      "id": "1704067200000",
      "word": "happy",
      "partOfSpeech": ["형용사"],
      "examples": [
        {
          "english": "I am happy to see you.",
          "korean": "당신을 만나서 기쁩니다."
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 주의사항
- OpenAI API 키는 유료 사용량에 따라 과금됩니다
- Google TTS API도 사용량에 따라 과금됩니다 (월 100만 자까지 무료)
- `.env` 파일은 절대 Git에 커밋하지 마세요

## 개발
본 프로젝트는 **GitHub Copilot (Claude Sonnet 4.5)** 및 **Claude Sonnet 4.5 AI**를 활용하여 코드 작성, 리팩토링 및 문서화 작업을 수행했습니다.

## 저장소
본 프로젝트는 2개의 저장소로 구성되어 있습니다:

- **백엔드 (Node.js)** - 현재 저장소
  - OpenAI GPT 연동, TTS, 데이터 관리, API 서버
  
- **프론트엔드 (React)**
  - https://github.com/HeoSeonJin0504/ai-english-trainer-front.git