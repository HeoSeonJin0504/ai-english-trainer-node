import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_STORAGE || './data/database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

// 데이터베이스 연결 테스트
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('데이터베이스 연결 성공');
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error.message);
    return false;
  }
};

// 데이터베이스 동기화
export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('데이터베이스 동기화 완료');
  } catch (error) {
    console.error('데이터베이스 동기화 실패:', error.message);
    throw error;
  }
};

export default sequelize;
