const { Sequelize } = require('sequelize');
const path = require('path');

// Use a dynamic database URL if provided (standard for Railway/Heroku)
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'mysql',
      dialectModule: require('mysql2'),
      logging: false
    })
  : new Sequelize(
      process.env.DB_NAME || 'mutual_transfer',
      process.env.DB_USER || 'root',
      process.env.DB_PASS || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false
      }
    );

const User = require('./User')(sequelize);
const Request = require('./Request')(sequelize);
const Match = require('./Match')(sequelize);
const Setting = require('./Setting')(sequelize);

User.hasMany(Request, { foreignKey: 'userId', as: 'requests' });
Request.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Match.belongsTo(User, { as: 'User1', foreignKey: 'user1Id' });
Match.belongsTo(User, { as: 'User2', foreignKey: 'user2Id' });

module.exports = {
  sequelize,
  User,
  Request,
  Match,
  Setting
};
