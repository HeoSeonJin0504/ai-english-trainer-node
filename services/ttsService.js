import ttsClient from '../config/googleTTS.js';
import { BusinessException } from '../utils/errors.js';

// 텍스트를 음성으로 변환
export const synthesizeSpeech = async (text, speed = 1.0, voice = 'female') => {
  // TTS 클라이언트 확인
  if (!ttsClient) {
    throw new BusinessException(
      'TTS 서비스를 사용할 수 없습니다. Web Speech API를 사용해주세요.',
      503
    );
  }

  // 음성 선택
  const voiceName = voice === 'male' 
    ? 'en-US-Neural2-D'   // 남성 음성
    : 'en-US-Neural2-J';  // 여성 음성

  // 속도 제한 (0.5 ~ 2.0)
  const speakingRate = Math.max(0.5, Math.min(2.0, speed || 1.0));

  // Google TTS 요청 설정
  const request = {
    input: { text },
    voice: {
      languageCode: 'en-US',
      name: voiceName,
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate,
      pitch: 0,
      volumeGainDb: 0,
    },
  };

  // TTS 생성
  const [response] = await ttsClient.synthesizeSpeech(request);

  // MP3를 base64로 인코딩
  const audioContent = response.audioContent.toString('base64');

  console.log(`TTS 생성 완료: ${text.length}자 -> ${response.audioContent.length} bytes`);

  return {
    audio: audioContent,
    contentType: 'audio/mp3',
    textLength: text.length,
  };
};

// TTS 서비스 상태 확인
export const checkStatus = () => {
  const available = !!ttsClient;

  return {
    available,
    message: available 
      ? '✅ Google TTS 사용 가능' 
      : '⚠️ Google TTS 사용 불가 - Web Speech API로 대체 사용',
  };
};

export default {
  synthesizeSpeech,
  checkStatus,
};