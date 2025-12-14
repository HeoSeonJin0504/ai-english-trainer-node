import ttsClient from '../config/googleTTS.js';

/**
 * 텍스트를 음성으로 변환하는 컨트롤러
 */
export const textToSpeech = async (req, res, next) => {
  try {
    const { text, speed = 1.0, voice = 'female' } = req.body;

    // 입력 검증
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: '텍스트를 입력해주세요.'
      });
    }

    // 텍스트 길이 제한 (1000자)
    if (text.length > 1000) {
      return res.status(400).json({
        success: false,
        error: '텍스트는 1000자 이하여야 합니다.'
      });
    }

    // TTS 클라이언트 확인
    if (!ttsClient) {
      return res.status(503).json({
        success: false,
        error: 'TTS 서비스를 사용할 수 없습니다. Web Speech API를 사용해주세요.',
        fallback: true
      });
    }

    // 음성 선택
    const voiceName = voice === 'male' 
      ? 'en-US-Neural2-D'  // 남성 음성
      : 'en-US-Neural2-J'; // 여성 음성

    // Google TTS 요청 설정
    const request = {
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: voiceName,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: Math.max(0.5, Math.min(2.0, speed)), // 0.5 ~ 2.0 범위로 제한
        pitch: 0,
        volumeGainDb: 0,
      },
    };

    // TTS 생성
    const [response] = await ttsClient.synthesizeSpeech(request);

    // MP3를 base64로 인코딩
    const audioContent = response.audioContent.toString('base64');

    res.json({
      success: true,
      audio: audioContent,
      contentType: 'audio/mp3',
      textLength: text.length
    });

  } catch (error) {
    console.error('TTS 생성 에러:', error);
    next(error);
  }
};

/**
 * TTS 서비스 상태 확인
 */
export const checkStatus = (req, res) => {
  res.json({
    success: true,
    available: !!ttsClient,
    message: ttsClient 
      ? '✅ Google TTS 사용 가능' 
      : '⚠️  Google TTS 사용 불가 - Web Speech API로 대체 사용'
  });
};