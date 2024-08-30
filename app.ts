import express from "express";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from 'express';
const { CustomError } = require("./utils/errors");

dotenv.config();

const bodyParser = require('body-parser');
const measuresRoutes = require('./routes/measures');
const imagesRoutes = require('./routes/images');

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});
app.use(measuresRoutes);
app.use(imagesRoutes);

app.use((error: Error, req: Request, res: Response): void => {
  if (error instanceof CustomError) { 
    const status = (error as CustomError).error_status || 500;
    res.status(status).json((error as CustomError).toJSON());
  } 
  else if (error.name === "PayloadTooLargeError") {
    res.status(413).json({ message: "Payload too large. Please reduce the size of your request." })
  }
  else {
    res.status(500).json({ message: "Something went wrong. Please, try again later." });
  }
});

app.listen(port, () => {
  console.log(`Server is running in port ${port}`);
});
