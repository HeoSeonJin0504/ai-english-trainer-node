//  데이터베이스 초기화 스크립트, 실행: npm run db:init

import { syncDatabase, testConnection } from '../config/database.js';
import '../models/index.js';

const initDatabase = async () => {
  try {
    console.log('데이터베이스 초기화 시작...\n');

    // 연결 테스트
    const connected = await testConnection();
    if (!connected) {
      throw new Error('데이터베이스 연결 실패');
    }

    // 테이블 동기화 (기존 테이블 삭제 후 재생성)
    const force = process.argv.includes('--force');
    if (force) {
      console.log('!--force 기존 데이터가 삭제됩니다!');
    }

    await syncDatabase(force);

    console.log('\n데이터베이스 초기화 완료!');
    console.log('\n생성된 테이블:');
    console.log('  - users');
    console.log('  - words');
    console.log('  - examples');
    console.log('  - questions');

    process.exit(0);
  } catch (error) {
    console.error('데이터베이스 초기화 실패:', error);
    process.exit(1);
  }
};

initDatabase();