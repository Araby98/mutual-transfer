const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Match', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user1Id: { type: DataTypes.INTEGER, allowNull: false },
    user2Id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'pending' }
  }, {
    timestamps: true
  });
};
