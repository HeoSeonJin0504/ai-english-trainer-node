import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [4, 50],
      is: /^[a-zA-Z0-9_]+$/,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,       // OAuth 사용자는 비밀번호 없음
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,       // OAuth 사용자는 전화번호 없음
    unique: true,
    validate: {
      is: /^01[0-9]{8,9}$/,
    },
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  gender: {
    type: DataTypes.ENUM('MALE', 'FEMALE'),
    allowNull: true,       // OAuth 사용자는 성별 정보 없을 수 있음
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,       // OAuth 사용자는 나이 정보 없을 수 있음
    validate: {
      min: 1,
      max: 150,
    },
  },
  provider: {
    type: DataTypes.ENUM('LOCAL', 'GOOGLE', 'KAKAO', 'NAVER'),
    allowNull: false,
    defaultValue: 'LOCAL', // 기존 일반 로그인 사용자
  },
  providerId: {
    type: DataTypes.STRING(100),
    allowNull: true,       // LOCAL 사용자는 null
    field: 'provider_id',
  },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['provider', 'provider_id'],  // 같은 Provider의 중복 가입 방지
      name: 'unique_provider_providerId',
    },
  ],
});

// 비밀번호 해싱 훅
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password') && user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

// 비밀번호 확인 메서드
User.prototype.validatePassword = async function(password) {
  if (!this.password) return false; // OAuth 사용자는 항상 false
  return bcrypt.compare(password, this.password);
};

// JSON 변환 시 비밀번호 제외
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

export default User;