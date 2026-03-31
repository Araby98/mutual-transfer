const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Request', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    toProvince: { type: DataTypes.STRING, allowNull: false }
  }, {
    timestamps: true
  });
};
