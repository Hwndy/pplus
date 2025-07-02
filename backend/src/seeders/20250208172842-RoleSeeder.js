'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Roles', [
      {
        name: "Company",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Supervisor",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Analyst",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Client",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  async down (queryInterface, Sequelize) {
    
      await queryInterface.bulkDelete('Roles', null, {});
  }
};
