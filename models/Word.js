import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Word = sequelize.define('Word', {
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
  word: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  partOfSpeech: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'part_of_speech',
  },
  meaning: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'words',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'word', 'part_of_speech'],
      name: 'unique_user_word_pos',
    },
  ],
});

export default Word;
