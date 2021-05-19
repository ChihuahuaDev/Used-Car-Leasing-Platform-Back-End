const express = require("express");
const router = express.Router();
const booking = require("./models/booking");
const Sequelize = require("sequelize");
const constants = require("./constant");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs-extra");
const Op = Sequelize.Op;
const jwt = require("./middleware/jwtParser");

// Upload Payment Evidence Image
uploadPaymentEvidence = async (files, doc) => {
  console.log("Get here 1");
  if (files.paymentevidence != null) {
    var fileExtention = files.paymentevidence.name.split(".")[1];
    doc.paymentevidence = `${doc.id}.${fileExtention}`;
    console.log("Get here 2");
    var newpath =
      path.resolve(__dirname + "/uploaded/images/paymentevidences/") +
      "/" +
      doc.paymentevidence;
    if (fs.access(newpath)) {
      await fs.remove(newpath);
    }
    await fs.moveSync(files.paymentevidence.path, newpath);
    console.log(fileExtention);
    console.log(doc.id);
    console.log(doc.paymentevidence);
    // Update database
    let paymentevidenceResult = booking.update(
      {
        paymentevidence:
          "http://localhost:8085/images/paymentevidences/" +
          doc.paymentevidence,
        status: "paid",
      },
      { where: { id: doc.id } }
    );
    return paymentevidenceResult;
  }
};

// Get Self Booking
router.get("/booking", jwt.verify, async (req, res) => {
  try {
    let result = await booking.findAll({
      where: { useremail: req.emailjwt },
    });
    res.json(result);
  } catch (error) {
    res.json({ message: "Database Error" });
  }
});

// Get All Booking
router.get("/booking/all", jwt.isAdmin, async (req, res) => {
  try {
    let result = await booking.findAll({ order: Sequelize.literal("id DESC") });
    res.json(result);
  } catch (error) {
    res.json({ message: "Database Connection Lost" });
  }
});

// Add Booking
router.post("/booking", jwt.verify, async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (error, fields, files) => {
      let bookingDetails = {
        carid: fields.carid,
        carmake: fields.carmake,
        carmodel: fields.carmodel,
        caryear: fields.caryear,
        carprice: fields.carprice,
        carimage: fields.carimage,
        userid: req.useridjwt,
        useremail: req.emailjwt,
        userfullname: req.fullnamejwt,
        userphonenumber: req.phonenumberjwt,
        date: fields.date,
      };
      let result = await booking.findOne({
        where: { date: bookingDetails.date, carid: bookingDetails.carid },
      });
      if (result != null) {
        res.json({
          status: "error",
          dateError: true,
          dateErrorMessage: "The selected date is unavailable",
        });
      } else {
        let bookingResult = await booking.create(bookingDetails);
        bookingResult = await uploadPaymentEvidence(files, bookingResult);
        res.json({
          result: constants.kResultOk,
          message: "Success",
        });
      }
    });
  } catch (error) {
    res.json({ result: constants.kResultNok, message: "Error" });
  }
});

// Admin Add Booking
router.post("/booking/admin", jwt.isAdmin, async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (error, fields, files) => {
      console.log(fields.date);
      let bookingDetails = {
        carid: fields.carid,
        carmake: fields.carmake,
        carmodel: fields.carmodel,
        caryear: fields.caryear,
        carprice: fields.carprice,
        carimage: fields.carimage,
        userid: fields.userid,
        useremail: fields.useremail,
        userfullname: fields.userfullname,
        userphonenumber: fields.userphonenumber,
        date: fields.date,
      };
      let result = await booking.findOne({
        where: { date: bookingDetails.date, carid: bookingDetails.carid },
      });
      if (result != null) {
        res.json({
          status: "error",
          dateError: true,
          dateErrorMessage: "The selected date is unavailable",
        });
      } else {
        let bookingResult = await booking.create(bookingDetails);
        bookingResult = await uploadPaymentEvidence(files, bookingResult);
        res.json({
          result: constants.kResultOk,
          message: "Success",
        });
      }
    });
  } catch (error) {
    res.json({ result: constants.kResultNok, message: "Error" });
  }
});

// Update Booking
router.put("/booking", jwt.isAdmin, async (req, res) => {
  try {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      let bookingDetails = {
        id: fields.bookingid,
        carid: fields.carid,
        carmake: fields.carmake,
        carmodel: fields.carmodel,
        caryear: fields.caryear,
        carprice: fields.carprice,
        carimage: fields.carimage,
        userid: fields.userid,
        useremail: fields.useremail,
        userfullname: fields.userfullname,
        userphonenumber: fields.userphonenumber,
        date: fields.date,
        status: fields.status,
        paymentevidence: fields.paymentevidence,
      };
      let result = await booking.update(bookingDetails, {
        where: { id: fields.bookingid },
      });
      if (files.paymentevidence != null) {
        console.log("Get here 0");
        result = await uploadPaymentEvidence(files, bookingDetails);
      }
      res.json({
        status: "success",
        message: "Successfully updated",
      });
    });
  } catch (error) {
    res.json({ status: "error", message: JSON.stringify(error) });
  }
});

// Delete Booking
router.delete("/booking/:id", jwt.isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let result = await booking.findOne({ where: { id: id } });
    await fs.remove(
      path.resolve(__dirname + "/uploaded/images/paymentevidences/") +
        "/" +
        result.image
    );
    result = await booking.destroy({ where: { id: id } });
    res.json({ result: constants.kResultOk, message: "Success" });
  } catch (error) {
    res.json({ result: constants.kResultNok, message: "Internal error" });
  }
});

// Get Booking by Id
router.get("/booking/:id", async (req, res) => {
  let result = await booking.findOne({ where: { id: req.params.id } });
  if (result) {
    res.json(result);
  } else {
    res.json({});
  }
});

// Search Booking by Keywords
router.get(
  "/booking/search/keyword/:keyword",
  jwt.isAdmin,
  async (req, res) => {
    try {
      const { keyword } = req.params;
      let result = await booking.findAll({
        where: {
          [Op.or]: [
            { useremail: { [Op.like]: `%${keyword}%` } },
            { userphonenumber: { [Op.like]: `%${keyword}%` } },
          ],
        },
      });
      res.json(result);
    } catch (error) {
      res.json({ message: "Not found" });
    }
  }
);

// Search Booking by Phone Number
router.post("/booking/search/phonenumber", jwt.isAdmin, async (req, res) => {
  try {
    let result = await booking.findAll({
      where: { userphonenumber: req.body.phonenumber },
    });
    res.json(result);
  } catch (error) {
    res.json({ message: "Not found" });
  }
});

// Search Booking by Email
router.post("/booking/search/email", jwt.isAdmin, async (req, res) => {
  try {
    let result = await booking.findAll({
      where: { useremail: req.body.email },
    });
    res.json(result);
  } catch (error) {
    res.json({ message: "Not found" });
  }
});

module.exports = router;
