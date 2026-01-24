import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Example = sequelize.define('Example', {
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
  wordId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'word_id',
    references: {
      model: 'words',
      key: 'id',
    },
  },
  english: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  korean: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
}, {
  tableName: 'examples',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default Example;
