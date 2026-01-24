import sequelize from '../config/database.js';
import User from './User.js';
import Word from './Word.js';
import Example from './Example.js';
import Question from './Question.js';

// 관계 설정
// User - Word (1:N)
User.hasMany(Word, { foreignKey: 'userId', as: 'words' });
Word.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - Example (1:N)
User.hasMany(Example, { foreignKey: 'userId', as: 'examples' });
Example.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Word - Example (1:N, 선택적)
Word.hasMany(Example, { foreignKey: 'wordId', as: 'examples' });
Example.belongsTo(Word, { foreignKey: 'wordId', as: 'word' });

// User - Question (1:N)
User.hasMany(Question, { foreignKey: 'userId', as: 'questions' });
Question.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { sequelize, User, Word, Example, Question };
export default { sequelize, User, Word, Example, Question };