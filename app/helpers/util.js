"use strict";
import fs from "fs";
import csvtojson from "csvtojson";
import dotenv from "dotenv";
dotenv.config();

//Generate Headers
const generateHeaders = (jsonObject) => {
  const valuesArray = Object.values(jsonObject);
  const isHeader =
    valuesArray.includes("SESSION ID") &&
    valuesArray.includes("ORIGINATOR / BILLER") &&
    valuesArray.includes("AMOUNT") &&
    valuesArray.includes("DESTINATION ACCOUNT NO") &&
    valuesArray.includes("CHANNEL");

  if (isHeader) {
    return isHeader;
  }
  return isHeader;
};

//Columns to Mirror Report file
const columns = [
  "SN",
  "CHANNEL",
  "SESSION_ID",
  "TRANSACTION_TYPE",
  "RESPONSE",
  "AMOUNT",
  "TRANSACTION_TIME",
  "ORIGINATOR_INSTITUTION",
  "ORIGINATOR_BILLER",
  "DESTINATION_INSTITUTION",
  "DESTINATION_ACCOUNT_NAME",
  "DESTINATION_ACCOUNT_NO",
  "NARRATION",
  "PAYMENT_REFERENCE",
  "LAST_12_DIGITS_OF_SESSION_ID",
];

//Rename Columns
const RenameColumn = (columnArray, jsonObject) => {
  let i = 0;

  for (var key in jsonObject) {
    jsonObject[columnArray[i]] = jsonObject[key];
    delete jsonObject[key];
    i++;
  }
  return jsonObject;
};

//JSON File
const JSON_FILE = process.env.NIBSS_JSON_FILE_PATH;

//Database Table Name
const DB_TABLE = process.env.DB_TABLE_NAME;

//JSON
const ReadNIBSSJSON = (file) => {
  let hexData = fs.readFileSync(file);
  let data = JSON.parse(hexData);
  return data;
};

//Read CSV
const ReadCSV = async (csvfile) => {
  try {
    const jsonArray = await csvtojson()
      .fromFile(csvfile)
      .then((file) => {
        return file;
      });

    let startingRow = 0;

    for (let i = 0; i < jsonArray.length; i++) {
      const isHeader = generateHeaders(jsonArray[i]);
      if (isHeader) {
        startingRow = i;
        break;
      }
    }

    jsonArray.splice(0, startingRow);

    for (let i = startingRow; i < jsonArray.length; i++) {
      jsonArray[i] = RenameColumn(columns, jsonArray[i]);
    }

    return { fileExists: true, jsonArray };
  } catch (error) {
    console.log(csvfile + " does not exist.");
    return { fileExists: false, jsonArray: null };
  }
};

//Format INSERT Values
const FormatInsertValues = (items) => {
  for (let i = 0; i < items.length; i++) {
    let str = String(items[i]);
    let newString = str.replaceAll("'", "");
    items[i] = "'" + newString + "'";
  }
  return items;
};

//SSMS Config
const timeout = 100_000_000;
const ssmsConfig = {
  server: process.env.SQL_SERVER_NAME,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_USER_PASSWORD,
  options: {
    trustServerCertificate: true,
  },
  requestTimeout: timeout,
  pool: {
    max: 1000,
    min: 1,
    idleTimeoutMillis: timeout,
    acquireTimeoutMillis: timeout,
    createTimeoutMillis: timeout,
    destroyTimeoutMillis: timeout,
    reapIntervalMillis: timeout,
    createRetryIntervalMillis: timeout,
  },
};

export {
  generateHeaders,
  RenameColumn,
  ReadCSV,
  ReadNIBSSJSON,
  ssmsConfig,
  columns,
  FormatInsertValues,
  JSON_FILE,
  DB_TABLE
};
