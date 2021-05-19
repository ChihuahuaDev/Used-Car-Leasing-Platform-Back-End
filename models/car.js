const Sequelize = require("sequelize");
const sequelize = require("../db_instance");

const car = sequelize.define(
  "car",
  {
    make: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    model: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    year: {
      type: Sequelize.NUMBER,
      // allowNull defaults to true
    },
    licensePlate: {
      type: Sequelize.STRING,
      // allowNull defaults to true
    },
    chassisNumber: {
      type: Sequelize.STRING,
      // allowNull defaults to true
    },
    miles: {
      type: Sequelize.NUMBER,
      // allowNull defaults to true
    },
    buyPrice: {
      type: Sequelize.NUMBER,
      // allowNull defaults to true
    },
    sellPrice: {
      type: Sequelize.NUMBER,
    },
    image: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "-",
    },
    formerOwnerName: {
      type: Sequelize.STRING,
    },
    formerOwnerPhoneNumber: {
      type: Sequelize.STRING,
    },
    history: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
    },
  },
  {
    // options
  }
);

(async () => {
  await car.sync({ force: false });
})();

module.exports = car;
