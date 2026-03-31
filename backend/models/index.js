const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize('mutual_transfer', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

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
