const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Setting', {
    key: { type: DataTypes.STRING, primaryKey: true },
    value: { type: DataTypes.STRING, allowNull: false }
  }, {
    timestamps: false
  });
};
