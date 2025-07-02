'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Subsidiary, {
        foreignKey: 'company_id',
        as: 'subsidiary'
      })
    }
  }
  Company.init({
    name: DataTypes.STRING,
    industry: DataTypes.STRING,
    sub_industry: DataTypes.STRING,
    address: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    email: DataTypes.STRING,
    contact: DataTypes.STRING,
    ceo: DataTypes.STRING,
    phone_no: DataTypes.STRING,
    website: DataTypes.STRING,
    facebook_link: DataTypes.STRING,
    instagram_link: DataTypes.STRING,
    twitter_link: DataTypes.STRING,
    linkedin_link: DataTypes.STRING,
    youtube_link: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Company',
    timestamps: true
  });
  return Company;
};