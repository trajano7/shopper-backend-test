import { MeasureData } from "./../utils/repository";
/*
This file contains endpoints related to managing measurements
*/

import express from "express";
import { v4 as uuidv4 } from "uuid";

const {
  checkUploadParams,
  checkConfirmParams,
  isValidMeasureType,
} = require("../utils/validation");
import path from "path";

const {
  checkIfMeasureExists,
  insertNewMeasure,
  getMeasureByID,
  confirmMeasureValue,
  getMeasureListByUser,
} = require("../utils/repository");
const { getMeasureValueFromImg } = require("../utils/apiRequests");
const { saveBase64Img, deleteImage } = require("../utils/fileManager");

const router = express.Router();

// POST endpoint - Upload and send image to Gemini API
router.post("/upload", async (req, res, next) => {
  const { image, customer_code, measure_datetime, measure_type } = req.body;

  // Validate params
  const errors = checkUploadParams(
    customer_code,
    image,
    measure_datetime,
    measure_type
  );
  if (errors.length > 0) {
    const invalidParameters = errors.join(", ");

    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description: `The following parameters are invalid: ${invalidParameters}`,
    });
  }

  try {
    const measureDate = new Date(measure_datetime);

    await checkIfMeasureExists(customer_code, measure_type, measureDate);

    // Generate measure ID and save the image in local files
    const measureGUID = uuidv4();
    saveBase64Img(image, measureGUID + ".jpg");

    // Call Gemini API to get the measure
    const filePath = path.join(process.cwd(), "images", measureGUID + ".jpg");
    const measureValue = await getMeasureValueFromImg(filePath, measureGUID);

    // Insert measure in the database
    await insertNewMeasure(
      customer_code,
      measureGUID,
      measure_type,
      measureDate,
      measureValue,
      false
    );

    const imageUrl = `${req.protocol}://${req.get(
      "host"
    )}/images/${measureGUID}.jpg`;
    res.json({
      image_url: imageUrl,
      measure_value: measureValue,
      measure_uuid: measureGUID,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH endpoint - Save the measure value confirmed by the client
router.patch("/confirm", async (req, res, next) => {
  const { measure_uuid, confirmed_value } = req.body;

  // Validate params
  const errors = checkConfirmParams(measure_uuid, confirmed_value);
  if (errors.length > 0) {
    const invalidParameters = errors.join(", ");

    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description: `The following parameters are invalid: ${invalidParameters}`,
    });
  }

  try {
    // Check if measure exists
    const result = await getMeasureByID(measure_uuid);
    // Check if the measure was already comfirmed
    if (result.has_confirmed) {
      return res.status(409).json({
        error_code: "CONFIRMATION_DUPLICATE",
        error_description: "Leitura já confirmada.",
      });
    }

    // Save the user confirmed measure value
    await confirmMeasureValue(measure_uuid, confirmed_value);
    deleteImage(measure_uuid);
    res.json({ seucess: true });
  } catch (error) {
    next(error);
  }
});

// GET endpoint - Return the measure list from a user
router.get("/:customer_code/list", async (req, res, next) => {
  const customer_code = req.params.customer_code;
  const { measure_type } = req.query;

  // Check if measure_type filter was specified and if its a valid type
  if (measure_type && !isValidMeasureType(measure_type)) {
    return res.status(400).json({
      error_code: "INVALID_TYPE",
      error_description: "Tipo de medição não permitida",
    });
  }

  // Return the measure list
  try {
    const response = await getMeasureListByUser(customer_code, measure_type);

    const measuresList = response.map((item: MeasureData) => {
      const imageUrl = `${req.protocol}://${req.get("host")}/images/${
        item.measure_uuid
      }.jpg`;
      return {
        ...item,
        image_url: item.has_confirmed
          ? null
          : imageUrl,
      };
    });

    res.json({ customer_code: customer_code, measures: measuresList });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
