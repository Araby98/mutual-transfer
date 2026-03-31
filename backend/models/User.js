const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    grade: { type: DataTypes.ENUM('administrateur', 'technicien'), allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    frmProvince: { type: DataTypes.STRING, allowNull: false },
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    verificationToken: { type: DataTypes.STRING, allowNull: true },
    resetToken: { type: DataTypes.STRING, allowNull: true },
    resetTokenExpiry: { type: DataTypes.DATE, allowNull: true }
  }, {
    timestamps: true
  });
};
