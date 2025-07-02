'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Editorial extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.MediaType, { foreignKey: 'media_type', as: 'mediaType_data' });

      this.belongsTo(models.Company, { foreignKey: 'company', as: 'company_data' });

      this.belongsTo(models.Publication, { foreignKey: 'publication', as: 'publication_data' });

      this.belongsTo(models.Placement, { foreignKey: 'placement', as: 'placement_data' });

      this.belongsTo(models.Activity, { foreignKey: 'activity', as: 'activity_data' });
    }
  }
  Editorial.init({
    date: DataTypes.DATE,
    media_type: DataTypes.INTEGER,
    company: DataTypes.INTEGER,
    brand: DataTypes.STRING,
    industry: DataTypes.STRING,
    sub_sector: DataTypes.STRING,
    publication: DataTypes.INTEGER,
    placement: DataTypes.INTEGER,
    title: DataTypes.STRING,
    page_number: DataTypes.INTEGER,
    link: DataTypes.STRING,
    reporter: DataTypes.STRING,
    country: DataTypes.STRING,
    spokesperson: DataTypes.STRING,
    activity: DataTypes.INTEGER,
    sentiment: DataTypes.STRING,
    media_sentiment_index: DataTypes.INTEGER,
    advert_spend: DataTypes.INTEGER,
    circulation: DataTypes.INTEGER,
    page_size: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Editorial',
  });
  return Editorial;
};