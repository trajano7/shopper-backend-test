import mysql from "mysql2/promise";
import { RowDataPacket } from "mysql2";
import dotenv from "dotenv";
const { CustomError } = require("./errors");

dotenv.config();

// Connects to the database
async function connectToDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
  });
  return connection;
}

interface MeasureCountResult extends RowDataPacket {
  count: number;
}

// Check if a measure already exists for the specified user within the given month.
async function checkIfMeasureExists(
  customerCode: string,
  measureType: string,
  measureDate: Date
) {
  const connection = await connectToDb();
  const startOfMonth = new Date(
    measureDate.getFullYear(),
    measureDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    measureDate.getFullYear(),
    measureDate.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  const sqlQuery = `SELECT COUNT(*) AS count FROM Measure 
  WHERE customer_code = ? AND measure_type = ? 
  AND measure_datetime BETWEEN ? AND ?`;

  const [rows] = await connection.execute<MeasureCountResult[]>(sqlQuery, [
    customerCode,
    measureType,
    startOfMonth.toISOString().slice(0, 19).replace("T", " "),
    endOfMonth.toISOString().slice(0, 19).replace("T", " "),
  ]);

  if (rows[0].count > 0) {
    throw new CustomError(409, "DOUBLE_REPORT", "Leitura do mês já realizada");
  }
}

export interface MeasureData extends RowDataPacket {
  measure_uuid: string;
  customer_code: string;
  measure_datetime: Date;
  measure_type: "WATER" | "GAS";
  measure_value: number;
  has_confirmed: boolean;
}

// Retrieve a measure record from the Measure table based on the provided measure ID.
async function getMeasureByID(measureID: string) {
  const connection = await connectToDb();
  const sqlQuery = `SELECT * FROM Measure WHERE measure_uuid = ?;`;

  const [rows] = await connection.execute<MeasureData[]>(sqlQuery, [
    measureID,
  ]);

  if (!rows[0]) {
    throw new CustomError(404, "MEASURE_NOT_FOUND", "Leitura não encontrada.");
  }

  return rows[0];
}

// Retrieve the measure list based on the provided customer code and measure type.
async function getMeasureListByUser(customerCode: string, measureType: string) {
  const connection = await connectToDb();
  const sqlQuery =
    `SELECT measure_uuid, measure_value, measure_datetime, measure_type, has_confirmed 
     FROM Measure WHERE customer_code = ?` +
    (measureType ? ` AND measure_type = ?;` : ";");

  const queryParams: string[] = [customerCode];
  if (measureType) {
    queryParams.push(measureType);
  }

  const [rows] = await connection.execute<MeasureData[]>(
    sqlQuery,
    queryParams
  );

  if (rows.length === 0) {
    throw new CustomError(
      404,
      "MEASURES_NOT_FOUND",
      "Nenhuma leitura encontrada"
    );
  }
  
  return rows;
}

// Insert a new user based on the customer code received if it does not exist yet
async function insertUserIfNotExist(customerCode: string) {
  const connection = await connectToDb();

  const sqlQuery = `
  INSERT INTO User (customer_code)
  SELECT ?
  WHERE NOT EXISTS (
      SELECT 1 FROM User WHERE customer_code = ?
  )`;

  const [result] = await connection.execute(sqlQuery, [
    customerCode,
    customerCode,
  ]);
}

// Insert a new measure in Measures table
async function insertNewMeasure(
  customerCode: string,
  measureID: string,
  measureType: string,
  measureDate: Date,
  measureValue: number,
  hasConfirmed: boolean
) {
  const connection = await connectToDb();
  await insertUserIfNotExist(customerCode);

  const formattedDateTime = measureDate
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const sqlQuery = `
  INSERT INTO Measure (measure_uuid, customer_code, measure_datetime, measure_type, measure_value, has_confirmed)
  VALUES (?, ?, ?, ?, ?, ?);`;

  const [result] = await connection.execute(sqlQuery, [
    measureID,
    customerCode,
    formattedDateTime,
    measureType,
    measureValue,
    hasConfirmed,
  ]);
}

// Update the measurement record with the confirmed value provided by the client and set the has_confirmed flag to true
async function confirmMeasureValue(measureID: string, confirmedValue: number) {
  const connection = await connectToDb();

  const sqlQuery = `UPDATE Measure SET has_confirmed = true, measure_value = ? WHERE measure_uuid = ?;`;

  const [result] = await connection.execute(sqlQuery, [
    confirmedValue,
    measureID,
  ]);
}

exports.checkIfMeasureExists = checkIfMeasureExists;
exports.insertNewMeasure = insertNewMeasure;
exports.getMeasureByID = getMeasureByID;
exports.confirmMeasureValue = confirmMeasureValue;
exports.getMeasureListByUser = getMeasureListByUser;

