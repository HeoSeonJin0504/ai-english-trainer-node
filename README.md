# AI English Trainer (Node.js)

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
- **단어 및 문제 관리**: 데이터베이스를 이용해 단어 및 문제 저장 및 관리

## 🛠️ 기술 스택

- **Runtime**: Node.js
- **Framework**: Express 5.x
- **Database**: MySQL + Sequelize ORM
- **Auth**: JWT
- **AI**: OpenAI GPT API
- **TTS**: Google Cloud Text-to-Speech

## 📁 프로젝트 구조

```
├── app.js                 # 서버 엔트리포인트
├── config/                # 설정 (DB, JWT, OpenAI, TTS)
├── models/                # Sequelize 모델
├── services/              # 비즈니스 로직
├── controllers/           # 요청/응답 처리
├── routes/                # API 라우팅
├── middleware/            # 인증, 에러, 유효성 검증
└── utils/                 # 유틸리티
```

## 📚 API 엔드포인트

| 구분 | 엔드포인트 | 설명 |
|------|-----------|------|
| 인증 | `/api/auth` | 회원가입, 로그인 |
| 단어 | `/api/words` | 단어 CRUD, 검색 |
| 예문 | `/api/examples` | 예문 CRUD, 검색 |
| 문제 | `/api/questions` | TOEIC/영작 문제 CRUD |
| 생성 | `/api/generate` | 예문/문제 생성 |
| TTS | `/api/tts` | 텍스트 음성 변환 |

### Google Cloud TTS 설정 방법

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. Text-to-Speech API 활성화
3. 서비스 계정 생성 및 JSON 키 다운로드
4. `config/google-credentials.json`에 키 파일 저장
5. 환경 변수에 경로 설정

## 🚀 설치 및 실행

### 1. MySQL 데이터베이스 생성

```sql
CREATE DATABASE ai_english_trainer;
```

### 2. 환경변수 설정

```bash
cp .env.example .env
# .env 파일 편집
```

### 3. 의존성 설치 및 실행

```bash
npm install
npm run dev
```

서버가 정상적으로 실행되면 다음과 같은 메시지가 표시됩니다:
```
서버가 3000 포트에서 열리고 있습니다.
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