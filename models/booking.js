const Sequelize = require("sequelize");
const sequelize = require("../db_instance");

const booking = sequelize.define(
  "booking",
  {
    carid: {
      type: Sequelize.NUMBER,
      allowNull: false,
    },
    carmake: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    carmodel: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    carprice: {
      type: Sequelize.NUMBER,
      allowNull: false,
    },
    caryear: {
      type: Sequelize.NUMBER,
      allowNull: true,
    },
    carimage: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    userid: {
      type: Sequelize.NUMBER,
      allowNull: false,
    },
    useremail: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    userfullname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    userphonenumber: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    date: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: "processing",
    },
    paymentevidence: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "-",
    },
  },
  {
    // options
  }
);

(async () => {
  await booking.sync({ force: false });
})();

module.exports = booking;
