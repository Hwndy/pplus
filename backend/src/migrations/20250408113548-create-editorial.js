'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Editorials', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATE
      },
      media_type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'MediaTypes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      company: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      brand: {
        type: Sequelize.STRING
      },
      industry: {
        type: Sequelize.STRING
      },
      sub_sector: {
        type: Sequelize.STRING
      },
      publication: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Publications',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      placement: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Placements',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      title: {
        type: Sequelize.STRING
      },
      page_number: {
        type: Sequelize.INTEGER
      },
      link: {
        type: Sequelize.STRING
      },
      reporter: {
        type: Sequelize.STRING
      },
      country: {
        type: Sequelize.STRING
      },
      spokesperson: {
        type: Sequelize.STRING
      },
      activity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Activities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      sentiment: {
        type: Sequelize.STRING
      },
      media_sentiment_index: {
        type: Sequelize.INTEGER
      },
      advert_spend: {
        type: Sequelize.INTEGER
      },
      circulation: {
        type: Sequelize.INTEGER
      },
      page_size: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Editorials');
  }
};