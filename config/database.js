import { Sequelize } from 'sequelize';
import config from './env.js';

// Supabase는 DATABASE_URL로 연결
const sequelize = new Sequelize(config.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    // Render → Supabase 연결 시 SSL 필수
    ssl: process.env.NODE_ENV === 'production'
      ? { require: true, rejectUnauthorized: false }
      : false,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});


// MySQL
// const sequelize = new Sequelize(
//   process.env.DB_NAME || 'ai_english_trainer',
//   process.env.DB_USER || 'root',
//   process.env.DB_PASSWORD || '',
//   {
//     host: process.env.DB_HOST || 'localhost',
//     port: process.env.DB_PORT || 3306,
//     dialect: 'mysql',
//     logging: process.env.NODE_ENV === 'development' ? console.log : false,
//     define: {
//       timestamps: true,
//       underscored: true,
//     },
//     pool: {
//       max: 10,
//       min: 0,
//       acquire: 30000,
//       idle: 10000,
//     },
//   }
// );

export const syncDatabase = async (force = false) => {
  try {
    await sequelize.authenticate();
    console.log('데이터베이스 연결 성공 (PostgreSQL/Supabase)');
    await sequelize.sync({ force });
    console.log('데이터베이스 동기화 완료');
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error.message);
    throw error;
  }
};


export default sequelize;