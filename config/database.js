import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ai_english_trainer',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
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
  }
);

export const syncDatabase = async (force = false) => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force });
    console.log('MySQL 데이터베이스 연결 및 동기화 완료');
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error.message);
    throw error;
  }
};

export default sequelize;