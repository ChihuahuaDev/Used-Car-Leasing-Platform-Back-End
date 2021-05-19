const express = require("express");
const router = express.Router();
const car = require("./models/car");
const Sequelize = require("sequelize");
const constants = require("./constant");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs-extra");
const Op = Sequelize.Op;
const jwt = require("./middleware/jwtParser");

// Upload Image
uploadImage = async (files, doc) => {
  if (files.image != null) {
    var fileExtention = files.image.name.split(".")[1];
    doc.image = `${doc.id}.${fileExtention}`;
    var newpath =
      path.resolve(__dirname + "/uploaded/images/cars/") + "/" + doc.image;
    if (fs.access(newpath)) {
      await fs.remove(newpath);
    }
    await fs.moveSync(files.image.path, newpath);

    // Update database
    let result = car.update(
      { image: "http://localhost:8085/images/cars/" + doc.image },
      { where: { id: doc.id } }
    );
    return result;
  }
};

// Get cars
router.get("/car", async (req, res) => {
  let result = await car.findAll({ order: Sequelize.literal("id DESC") });
  res.json(result);
});

// Add car
router.post("/car", jwt.isAdmin, async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (error, fields, files) => {
      let result = await car.create(fields);
      result = await uploadImage(files, result);
      res.json({
        result: constants.kResultOk,
        message: "New Car has been created",
      });
    });
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
  }
});

// Update car
router.put("/car", jwt.isAdmin, async (req, res) => {
  try {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      let result = await car.update(fields, { where: { id: fields.id } });
      if (files.image != null) {
        result = await uploadImage(files, fields);
      }
      res.json({
        result: constants.kResultOk,
        message: "Successfully Updated",
      });
    });
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
  }
});

// Delete car
router.delete("/car/:id", jwt.isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let result = await car.findOne({ where: { id: id } });
    await fs.remove(
      path.resolve(__dirname + "/uploaded/images/cars/") + "/" + result.image
    );
    result = await car.destroy({ where: { id: id } });
    res.json({ result: constants.kResultOk, message: "Car has been deleted" });
  } catch (error) {
    res.json({
      result: constants.kResultNok,
      message: "Can't find the car with the provided ID",
    });
  }
});

// Get car by Id
router.get("/car/:id", async (req, res) => {
  let result = await car.findOne({ where: { id: req.params.id } });
  if (result) {
    res.json(result);
  } else {
    res.json({ message: "Not found" });
  }
});

// Get cars by Keyword
router.get("/car/keyword/:keyword", async (req, res) => {
  try {
    const { keyword } = req.params;
    let result = await car.findAll({
      where: {
        make: { [Op.like]: `%${keyword}%` },
      },
    });
    res.json(result);
  } catch (error) {
    res.json({ message: "Not found" });
  }
});

module.exports = router;
