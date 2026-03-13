import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { Strategy as NaverStrategy } from 'passport-naver-v2';
import { User } from '../models/index.js';
import config from './env.js';

// Google 전략
passport.use(new GoogleStrategy(
  {
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: config.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value || null;
      const [user] = await User.findOrCreate({
        where: { provider: 'GOOGLE', providerId: String(profile.id) },
        defaults: {
          username: `google_${profile.id}`,
          email,
          provider: 'GOOGLE',
          providerId: String(profile.id),
        },
      });
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));


// Kakao 전략
passport.use(new KakaoStrategy(
  {
    clientID: config.KAKAO_CLIENT_ID,
    clientSecret: config.KAKAO_CLIENT_SECRET || '',
    callbackURL: config.KAKAO_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Kakao는 이메일이 선택 동의라 null 가능
      const email = profile._json?.kakao_account?.email || null;
      const [user] = await User.findOrCreate({
        where: { provider: 'KAKAO', providerId: String(profile.id) },
        defaults: {
          username: `kakao_${profile.id}`,
          email,
          provider: 'KAKAO',
          providerId: String(profile.id),
        },
      });
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Naver 전략
passport.use(new NaverStrategy(
  {
    clientID: config.NAVER_CLIENT_ID,
    clientSecret: config.NAVER_CLIENT_SECRET,
    callbackURL: config.NAVER_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.email || null;
      const [user] = await User.findOrCreate({
        where: { provider: 'NAVER', providerId: String(profile.id) },
        defaults: {
          username: `naver_${profile.id}`,
          email,
          provider: 'NAVER',
          providerId: String(profile.id),
        },
      });
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

export default passport;