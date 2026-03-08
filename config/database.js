import { Sequelize } from 'sequelize';
import config from './env.js';

const sequelize = new Sequelize(
  config.DB_NAME,
  config.DB_USER,
  config.DB_PASSWORD,
  {
    host: config.DB_HOST,
    port: config.DB_PORT,
    dialect: 'mysql',
    logging: config.NODE_ENV === 'development' ? console.log : false,
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
    console.log('데이터베이스 연결 성공 (MySQL)');
    await sequelize.sync({ force });
    console.log('데이터베이스 동기화 완료');
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error.message);
    throw error;
  }
};

export default sequelize;