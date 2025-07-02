'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subsidiary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Company, {
        foreignKey: 'company_id',
        as: 'company'
      });

      this.belongsTo(models.Company, {
        foreignKey: 'subsidiary_id',
        as: 'subsidiary'
      })
    }
  }
  Subsidiary.init({
    company_id: DataTypes.NUMBER,
    prefix: DataTypes.STRING,
    subsidiary_id: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Subsidiary',
    timestamps: true
  });
  return Subsidiary;
};