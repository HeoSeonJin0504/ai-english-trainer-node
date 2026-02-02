import ttsClient from '../config/googleTTS.js';
import { BusinessException } from '../utils/errors.js';

// Google Cloud TTS 음성 목록
const VOICE_MAP = {
  male: {
    primary: 'en-US-Neural2-D',
    alternatives: ['en-US-Neural2-A', 'en-US-Wavenet-D', 'en-US-Standard-D']
  },
  female: {
    primary: 'en-US-Neural2-F',
    alternatives: ['en-US-Neural2-C', 'en-US-Neural2-E', 'en-US-Wavenet-C']
  }
};

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
  const voiceConfig = voice === 'male' ? VOICE_MAP.male : VOICE_MAP.female;
  const voiceName = voiceConfig.primary;

  // 속도 제한 (0.5 ~ 2.0)
  const speakingRate = Math.max(0.5, Math.min(2.0, speed || 1.0));

  // Google TTS 요청 설정
  const request = {
    input: { text },
    voice: {
      languageCode: 'en-US',
      name: voiceName,
      ssmlGender: voice === 'male' ? 'MALE' : 'FEMALE',
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate,
      pitch: 0,
      volumeGainDb: 0,
    },
  };

  try {
    // TTS 생성
    const [response] = await ttsClient.synthesizeSpeech(request);

    // MP3를 base64로 인코딩
    const audioContent = response.audioContent.toString('base64');

    return {
      audio: audioContent,
      contentType: 'audio/mp3',
      textLength: text.length,
    };
  } catch (error) {
    // 음성 이름이 잘못된 경우 대체 음성 시도
    console.error(`음성 생성 실패 (${voiceName}), 대체 음성 시도:`, error.message);
    
    if (voiceConfig.alternatives.length > 0) {
      const alternativeVoice = voiceConfig.alternatives[0];
      request.voice.name = alternativeVoice;
      
      const [response] = await ttsClient.synthesizeSpeech(request);
      const audioContent = response.audioContent.toString('base64');
      
      return {
        audio: audioContent,
        contentType: 'audio/mp3',
        textLength: text.length,
      };
    }
    
    throw error;
  }
};

// TTS 서비스 상태 확인
export const checkStatus = () => {
  const available = !!ttsClient;

  return {
    available,
    message: available 
      ? 'Google TTS 사용 가능' 
      : 'Google TTS 사용 불가 - Web Speech API로 대체 사용',
  };
};

export default {
  synthesizeSpeech,
  checkStatus,
};