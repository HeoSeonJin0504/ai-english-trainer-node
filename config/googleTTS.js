import textToSpeech from '@google-cloud/text-to-speech';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Google TTS 클라이언트 생성
 */
const createTTSClient = () => {
  try {
    // 환경변수로 Google Cloud 인증 정보 설정
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      return new textToSpeech.TextToSpeechClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
      });
    } else if (process.env.GOOGLE_CREDENTIALS_JSON) {
      // 또는 JSON 직접 사용 (Railway, Vercel 등 배포 시)
      const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
      return new textToSpeech.TextToSpeechClient({
        credentials
      });
    } else {
      console.warn('⚠️  Google Cloud 인증 정보가 없습니다. TTS 기능이 비활성화됩니다.');
      return null;
    }
  } catch (error) {
    console.error('❌ Google TTS 클라이언트 생성 실패:', error.message);
    return null;
  }
};

const ttsClient = createTTSClient();

export default ttsClient;