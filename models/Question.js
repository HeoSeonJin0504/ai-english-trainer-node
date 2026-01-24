import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  mode: {
    type: DataTypes.ENUM('TOEIC', 'WRITING'),
    allowNull: false,
  },
  toeicPart: {
    type: DataTypes.ENUM('PART5', 'PART6', 'PART7'),
    allowNull: true,
    field: 'toeic_part',
  },
  writingType: {
    type: DataTypes.STRING(30),
    allowNull: true,
    field: 'writing_type',
  },
  topic: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  passage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  insertSentence: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'insert_sentence',
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  options: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('options');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('options', value ? JSON.stringify(value) : null);
    },
  },
  answer: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  hint: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'questions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default Question;