# AI English Trainer (Backend - Node.js)

OpenAI GPT API와 Google Cloud TTS를 활용한  
AI 기반 영어 학습 플랫폼의 백엔드 서버입니다.

사용자가 입력한 영어 단어를 기반으로  
예문 생성, TOEIC/영작 문제 자동 출제, 음성 변환, AI 챗봇 튜터 기능을 제공합니다.  
사용자별로 학습 데이터를 관리합니다.

---

## 주요 기능

- 사용자 회원가입 / 로그인 (JWT httpOnly Cookie 인증)
- Google / Kakao / Naver 소셜 로그인 (OAuth 2.0)
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
| Auth | JWT (httpOnly Cookie), Passport.js (OAuth 2.0) |
| Validation | express-validator |
| Security | express-rate-limit, bcryptjs |
| Logging | Winston |
| AI | OpenAI GPT API |
| TTS | Google Cloud Text-to-Speech |

---

## 📁 프로젝트 구조

```
├── app.js                 # 서버 엔트리포인트
├── config/                # 설정 (DB, JWT, OpenAI, TTS, Passport)
├── models/                # Sequelize 모델 및 관계 설정
├── services/              # 비즈니스 로직
├── controllers/           # 요청/응답 처리
├── routes/                # API 라우팅
├── middleware/            # 인증, 에러, Rate Limiting, 유효성 검증
├── dto/                   # 요청/응답 DTO (ChatRequest, ChatResponse)
└── utils/                 # 유틸리티 (에러 클래스, ApiResponse, Logger)
```

---

## 📚 API 엔드포인트

### 인증

| 메서드 | 엔드포인트 | 설명 | 인증 필요 |
|--------|-----------|------|----------|
| POST | `/api/auth/signup` | 회원가입 | ❌ |
| POST | `/api/auth/login` | 로그인 | ❌ |
| POST | `/api/auth/logout` | 로그아웃 | ❌ |
| GET | `/api/auth/me` | 현재 로그인 사용자 정보 조회 | ✅ |
| GET | `/api/auth/check-username` | 아이디 중복 확인 | ❌ |
| GET | `/api/auth/check-phone` | 핸드폰 번호 중복 확인 | ❌ |

### OAuth 소셜 로그인

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/auth/google` | Google 로그인 페이지로 리다이렉트 |
| GET | `/api/auth/google/callback` | Google 인증 콜백 |
| GET | `/api/auth/kakao` | Kakao 로그인 페이지로 리다이렉트 |
| GET | `/api/auth/kakao/callback` | Kakao 인증 콜백 |
| GET | `/api/auth/naver` | Naver 로그인 페이지로 리다이렉트 |
| GET | `/api/auth/naver/callback` | Naver 인증 콜백 |

> OAuth 인증 성공 시 JWT를 httpOnly Cookie에 발급하고 `CLIENT_URL/oauth/success`로 리다이렉트합니다.

### 단어

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/words` | 단어 저장 |
| GET | `/api/words` | 내 단어 전체 조회 |
| GET | `/api/words/count` | 단어 개수 조회 |
| GET | `/api/words/search?keyword=xxx` | 단어 검색 |
| GET | `/api/words/:id` | 단어 상세 조회 |
| DELETE | `/api/words/:id` | 단어 삭제 |

### 예문

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/examples` | 예문 저장 |
| GET | `/api/examples` | 내 예문 전체 조회 |
| GET | `/api/examples/count` | 예문 개수 조회 |
| GET | `/api/examples/search?keyword=xxx` | 예문 검색 |
| GET | `/api/examples/word/:wordId` | 특정 단어의 예문 조회 |
| GET | `/api/examples/:id` | 예문 상세 조회 |
| DELETE | `/api/examples/:id` | 예문 삭제 |

### 문제

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/questions` | 문제 저장 |
| GET | `/api/questions` | 내 문제 전체 조회 |
| GET | `/api/questions/count` | 문제 개수 조회 |
| GET | `/api/questions/search?topic=xxx` | 주제별 문제 검색 |
| GET | `/api/questions/toeic` | TOEIC 문제 전체 조회 |
| GET | `/api/questions/toeic/count` | TOEIC 문제 개수 조회 |
| GET | `/api/questions/toeic/:part` | TOEIC 파트별 문제 조회 (PART5/6/7) |
| GET | `/api/questions/writing` | 영작 문제 전체 조회 |
| GET | `/api/questions/writing/count` | 영작 문제 개수 조회 |
| GET | `/api/questions/:id` | 문제 상세 조회 |
| DELETE | `/api/questions/:id` | 문제 삭제 |

### AI 생성

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/generate/examples` | AI 예문/의미/유의어 생성 |
| POST | `/api/generate/questions` | AI 문제 생성 (TOEIC/영작) |

### 챗봇

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/chat/message` | 챗봇에게 메시지 전송 |
| GET | `/api/chat/conversations` | 내 대화 목록 조회 |
| GET | `/api/chat/history/:conversationId` | 특정 대화 히스토리 조회 |
| DELETE | `/api/chat/:conversationId` | 대화 삭제 |

### TTS

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/tts/speak` | 텍스트 음성 변환 |
| GET | `/api/tts/status` | TTS 서비스 상태 확인 |

> 인증이 필요한 모든 엔드포인트(`/api/words`, `/api/examples`, `/api/questions`, `/api/generate`, `/api/chat`, `/api/tts`)는 로그인 상태여야 접근할 수 있습니다.

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

**기본 설정**

| 환경변수 | 필수 | 설명 |
|---------|------|------|
| `ENGLISH_DB_HOST` | | MySQL 호스트 (기본값: localhost) |
| `ENGLISH_DB_PORT` | | MySQL 포트 (기본값: 3306) |
| `ENGLISH_DB_NAME` | ✅ | 데이터베이스 이름 |
| `ENGLISH_DB_USER` | ✅ | MySQL 사용자 |
| `ENGLISH_DB_PASSWORD` | ✅ | MySQL 비밀번호 |
| `ENGLISH_JWT_SECRET` | ✅ | JWT 서명 비밀 키 |
| `ENGLISH_JWT_EXPIRATION` | | 토큰 만료 시간 (기본값: 24h) |
| `OPENAI_API_KEY` | ✅ | OpenAI API 키 |
| `OPENAI_MODEL` | | 사용할 모델 (기본값: gpt-4o-mini) |
| `CLIENT_URL` | | 프론트엔드 URL (기본값: http://localhost:5173) |
| `CORS_ORIGINS` | | 추가 허용 오리진 (쉼표 구분) |

**Google Cloud TTS (선택)**

| 환경변수 | 설명 |
|---------|------|
| `GOOGLE_TTS_CREDENTIALS_BASE64` | Google TTS 서비스 계정 키 (Base64 인코딩, 배포 환경 권장) |
| `GOOGLE_TTS_CREDENTIALS_PATH` | Google TTS 키 파일 경로 (로컬 환경 권장) |

**OAuth 소셜 로그인 (선택)**

| 환경변수 | 설명 |
|---------|------|
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 클라이언트 시크릿 |
| `GOOGLE_CALLBACK_URL` | Google 인증 콜백 URL |
| `KAKAO_CLIENT_ID` | Kakao OAuth 클라이언트 ID |
| `KAKAO_CLIENT_SECRET` | Kakao OAuth 클라이언트 시크릿 |
| `KAKAO_CALLBACK_URL` | Kakao 인증 콜백 URL |
| `NAVER_CLIENT_ID` | Naver OAuth 클라이언트 ID |
| `NAVER_CLIENT_SECRET` | Naver OAuth 클라이언트 시크릿 |
| `NAVER_CALLBACK_URL` | Naver 인증 콜백 URL |

> OAuth 관련 환경변수가 없으면 해당 소셜 로그인 전략이 자동으로 비활성화됩니다.

### 3. 의존성 설치 및 실행

```bash
npm install
npm run dev
```

서버가 정상적으로 실행되면 다음과 같은 메시지가 표시됩니다.

```
데이터베이스 연결 성공 (MySQL)
데이터베이스 동기화 완료
서버가 3000 포트에서 실행 중입니다. (환경: development)
```

---

## Google Cloud TTS 설정

TTS는 선택 사항입니다. 설정하지 않으면 Web Speech API로 대체 작동합니다.

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. Text-to-Speech API 활성화
3. 서비스 계정 생성 및 JSON 키 다운로드

**로컬 환경**에서는 키 파일 경로를 직접 지정합니다.

```dotenv
GOOGLE_TTS_CREDENTIALS_PATH=./google-credentials.json
```

**배포 환경**에서는 키 파일을 Base64로 인코딩하여 환경변수로 주입합니다.

```bash
base64 -i google-credentials.json
```

```dotenv
GOOGLE_TTS_CREDENTIALS_BASE64=<위 명령어 출력값>
```

---

## OAuth 소셜 로그인 설정

### Google

1. [Google Cloud Console](https://console.cloud.google.com/) → API 및 서비스 → 사용자 인증 정보
2. OAuth 2.0 클라이언트 ID 생성
3. 승인된 리디렉션 URI에 콜백 URL 추가

```dotenv
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### Kakao

1. [Kakao Developers](https://developers.kakao.com/) → 내 애플리케이션 생성
2. 플랫폼 → Web 사이트 도메인 등록
3. Redirect URI 등록

```dotenv
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CALLBACK_URL=http://localhost:3000/api/auth/kakao/callback
```

### Naver

1. [Naver Developers](https://developers.naver.com/) → Application 등록
2. 서비스 URL 및 Callback URL 등록

```dotenv
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
NAVER_CALLBACK_URL=http://localhost:3000/api/auth/naver/callback
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