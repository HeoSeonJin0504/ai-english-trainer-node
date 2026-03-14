import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { Strategy as NaverStrategy } from 'passport-naver-v2';
import { User } from '../models/index.js';
import config from './env.js';

/**
 * OAuth 사용자 username 생성
 * 1순위: 이메일 앞부분 (user@gmail.com → user)
 * 2순위: provider + id 축약 (google_1234)
 * 중복 시: username_1, username_2, ... 순으로 suffix 추가
 */
const generateUniqueUsername = async (email, provider, providerId) => {
  // 베이스 이름 결정
  let base = email
    ? email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') // 특수문자 _ 치환
    : `${provider.toLowerCase()}_${String(providerId).slice(-6)}`; // 마지막 6자리만

  // 최대 20자 제한
  base = base.slice(0, 20);

  // 중복 확인 및 suffix 추가
  let username = base;
  let count = 1;
  while (await User.findOne({ where: { username } })) {
    username = `${base.slice(0, 18)}_${count}`;
    count++;
  }

  return username;
};

// Google 전략
if (config.GOOGLE_CLIENT_ID) {
  passport.use(new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || null;

        // 이미 가입된 사용자 조회
        const existingUser = await User.findOne({
          where: { provider: 'GOOGLE', providerId: String(profile.id) },
        });
        if (existingUser) return done(null, existingUser);

        // 신규 가입
        const username = await generateUniqueUsername(email, 'GOOGLE', profile.id);
        const user = await User.create({
          username,
          email,
          provider: 'GOOGLE',
          providerId: String(profile.id),
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
}

// Kakao 전략
if (config.KAKAO_CLIENT_ID) {
  passport.use(new KakaoStrategy(
    {
      clientID: config.KAKAO_CLIENT_ID,
      clientSecret: config.KAKAO_CLIENT_SECRET || '',
      callbackURL: config.KAKAO_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile._json?.kakao_account?.email || null;

        const existingUser = await User.findOne({
          where: { provider: 'KAKAO', providerId: String(profile.id) },
        });
        if (existingUser) return done(null, existingUser);

        const username = await generateUniqueUsername(email, 'KAKAO', profile.id);
        const user = await User.create({
          username,
          email,
          provider: 'KAKAO',
          providerId: String(profile.id),
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
}

// Naver 전략
if (config.NAVER_CLIENT_ID) {
  passport.use(new NaverStrategy(
    {
      clientID: config.NAVER_CLIENT_ID,
      clientSecret: config.NAVER_CLIENT_SECRET,
      callbackURL: config.NAVER_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.email || null;

        const existingUser = await User.findOne({
          where: { provider: 'NAVER', providerId: String(profile.id) },
        });
        if (existingUser) return done(null, existingUser);

        const username = await generateUniqueUsername(email, 'NAVER', profile.id);
        const user = await User.create({
          username,
          email,
          provider: 'NAVER',
          providerId: String(profile.id),
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
}

export default passport;