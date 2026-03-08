# AI English Trainer (Backend - Node.js)

OpenAI GPT API와 Google Cloud TTS를 활용한  
AI 기반 영어 학습 플랫폼의 백엔드 서버입니다.

사용자가 입력한 영어 단어를 기반으로  
예문 생성, TOEIC/영작 문제 자동 출제, 음성 변환, AI 챗봇 튜터 기능을 제공합니다.  
사용자별로 학습 데이터를 관리합니다.

---

## 주요 기능

- 사용자 회원가입 / 로그인 (JWT httpOnly Cookie 인증)
- 단어 저장 및 AI 기반 예문/의미/유의어/반의어 자동 생성
- TOEIC (Part 5/6/7) 및 영작 문제 자동 출제
- Google Cloud TTS 음성 변환
- AI 챗봇 영어 튜터 (세션 기반 대화 관리)
- 단어, 예문, 문제 저장 및 관리 (CRUD)

---

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| Runtime | Node.js |
| Framework | Express 5.x |
| Database | MySQL + Sequelize ORM |
| Auth | JWT (httpOnly Cookie) |
| Validation | express-validator |
| Security | express-rate-limit, bcryptjs, helmet |
| Logging | Winston |
| AI | OpenAI GPT API |
| TTS | Google Cloud Text-to-Speech |

---

## 📁 프로젝트 구조

```
├── app.js                 # 서버 엔트리포인트
├── config/                # 설정 (DB, JWT, OpenAI, TTS)
├── models/                # Sequelize 모델
├── services/              # 비즈니스 로직
├── controllers/           # 요청/응답 처리
├── routes/                # API 라우팅
├── middleware/            # 인증, 에러, Rate Limiting, 유효성 검증
├── dto/                   # 요청/응답 DTO
└── utils/                 # 유틸리티 (에러 클래스, ApiResponse, Logger)
```

---

## 📚 API 엔드포인트

| 구분 | 엔드포인트 | 설명 |
|------|-----------|------|
| 인증 | `POST /api/auth/signup` | 회원가입 |
| 인증 | `POST /api/auth/login` | 로그인 |
| 인증 | `POST /api/auth/logout` | 로그아웃 |
| 단어 | `GET/POST /api/words` | 단어 조회 / 저장 |
| 단어 | `GET/DELETE /api/words/:id` | 단어 상세 조회 / 삭제 |
| 단어 | `GET /api/words/search` | 단어 검색 |
| 예문 | `GET/POST /api/examples` | 예문 조회 / 저장 |
| 예문 | `GET/DELETE /api/examples/:id` | 예문 상세 조회 / 삭제 |
| 문제 | `GET/POST /api/questions` | 문제 조회 / 저장 |
| 문제 | `GET /api/questions/toeic` | TOEIC 문제 조회 |
| 문제 | `GET /api/questions/writing` | 영작 문제 조회 |
| 생성 | `POST /api/generate/examples` | AI 예문 생성 |
| 생성 | `POST /api/generate/questions` | AI 문제 생성 |
| 챗봇 | `POST /api/chat/message` | 챗봇 메시지 전송 |
| 챗봇 | `GET /api/chat/conversations` | 대화 목록 조회 |
| TTS | `POST /api/tts/speak` | 텍스트 음성 변환 |
| TTS | `GET /api/tts/status` | TTS 서비스 상태 확인 |

---

## 🚀 설치 및 실행

### 1. MySQL 데이터베이스 생성

```sql
CREATE DATABASE ai_english_trainer;
```

### 2. 환경변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성합니다.

```bash
cp .env.example .env
```

| 환경변수 | 필수 | 설명 |
|---------|------|------|
| `DB_HOST` | ✅ | MySQL 호스트 (기본값: localhost) |
| `DB_PORT` | | MySQL 포트 (기본값: 3306) |
| `DB_NAME` | ✅ | 데이터베이스 이름 |
| `DB_USER` | ✅ | MySQL 사용자 |
| `DB_PASSWORD` | ✅ | MySQL 비밀번호 |
| `JWT_SECRET` | ✅ | JWT 서명 비밀 키 |
| `JWT_EXPIRATION` | | 토큰 만료 시간 (기본값: 24h) |
| `OPENAI_API_KEY` | ✅ | OpenAI API 키 |
| `OPENAI_MODEL` | | 사용할 모델 (기본값: gpt-4o-mini) |
| `GOOGLE_TTS_CREDENTIALS_PATH` | | Google TTS 키 파일 경로 |
| `GOOGLE_TTS_CREDENTIALS_BASE64` | | Google TTS 키 (Base64 인코딩) |
| `CORS_ORIGINS` | | 허용할 프론트엔드 URL |

### 3. 의존성 설치 및 실행

```bash
npm install
npm run dev
```

서버가 정상적으로 실행되면 다음과 같은 메시지가 표시됩니다.

```
서버가 3000 포트에서 열리고 있습니다.
```

---

## Google Cloud TTS 설정

TTS는 선택 사항입니다. 설정하지 않으면 서버는 정상 실행되며, TTS 요청 시 503을 반환합니다.

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. Text-to-Speech API 활성화
3. 서비스 계정 생성 및 JSON 키 다운로드
4. 키 파일을 프로젝트 루트(또는 원하는 경로)에 저장
5. `.env`에 경로 설정

```dotenv
GOOGLE_TTS_CREDENTIALS_PATH=./google-credentials.json
```

---

## ⚠️ 주의사항

- OpenAI API 키와 Google TTS API는 사용량에 따라 과금됩니다.
- `.env` 파일과 `google-credentials.json`은 절대 Git에 커밋하지 마세요.

---

## 저장소

본 프로젝트는 3개의 저장소로 구성되어 있습니다.

- **백엔드 (Node.js)** — 현재 저장소
- **프론트엔드 (React)** — https://github.com/HeoSeonJin0504/ai-english-trainer-front.git
- **백엔드 (Java Spring Boot)** — https://github.com/HeoSeonJin0504/ai-english-trainer-spring.git