import textToSpeech from '@google-cloud/text-to-speech';

const createTTSClient = () => {
  try {
    if (process.env.GOOGLE_TTS_CREDENTIALS_BASE64) {
      const json = Buffer.from(process.env.GOOGLE_TTS_CREDENTIALS_BASE64, 'base64').toString('utf8');
      const credentials = JSON.parse(json);
      return new textToSpeech.TextToSpeechClient({ credentials });
    } else if (process.env.GOOGLE_TTS_CREDENTIALS_PATH) {
      return new textToSpeech.TextToSpeechClient({
        keyFilename: process.env.GOOGLE_TTS_CREDENTIALS_PATH,
      });
    } else {
      console.warn('AiEnglishTrainer의 Google TTS 인증 정보가 없습니다. TTS 기능이 비활성화됩니다.');
      return null;
    }
  } catch (error) {
    console.error('Google TTS 클라이언트 생성 실패:', error.message);
    return null;
  }
};

const ttsClient = createTTSClient();
export default ttsClient;