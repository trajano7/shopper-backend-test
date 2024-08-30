/*
This file contains endpoints related to image endpoints management
*/

import express from "express";
import path from "path";
import fs from "fs";

const { CustomError } = require("../utils/errors");

const router = express.Router();

// GET endpoint - Send back a image from the local storage
router.get("/images/:filename", (req, res, next) => {
  const { filename } = req.params;
  const filePath = path.join(process.cwd(), "images", filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      next(new CustomError(404, "IMAGE_NOT_FOUND", "Imagem não encontrada."));
    }
  });

  res.sendFile(filePath);
});

module.exports = router;
