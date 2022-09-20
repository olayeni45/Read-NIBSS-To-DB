//Imports
import fs from "fs";
import sql from "mssql";
import {
  ssmsConfig,
  ReadNIBSSJSON,
  ReadCSV,
  columns,
  JSON_FILE,
  FormatInsertValues,
} from "./helpers/util.js";

//SQL Connection
const conn = new sql.ConnectionPool(ssmsConfig);
const NIBSSJSONFile = ReadNIBSSJSON(JSON_FILE);

//Connect to DB
const ConnectToSQLDB = async () => {
  try {
    await conn
      .connect()
      .then(() => {
        console.log("Connected to SQL DB");
      })
      .catch((err) => {
        console.log("Connection error: ", err);
      });
  } catch (error) {
    throw `Unable to connect to DB: ${error}`;
  }
};

//Insert to DB Function
const InsertToSQLDB = async (InsertStatement, index, currentItem) => {
  try {
    await conn.query(InsertStatement, (error, recordSet) => {
      if (error) {
        fs.writeFile(`InsertError-${index}.txt`, currentItem, (err) => {
          // In case of a error throw err.
          if (err) throw err;
        });
        throw error;
      }
    });
  } catch (err) {
    console.log(err);
  }
};

await ConnectToSQLDB();

//Looping through each NIBSS file
NIBSSJSONFile.forEach(async (file) => {
  console.log("--------------------------------------------------");

  const { Product: PRODUCT, Direction: DIRECTION, File: NIBSSFILE } = file;

  console.log("Current file ", NIBSSFILE);
  console.log("Reading file into memory");

  const { jsonArray } = await ReadCSV(NIBSSFILE).then((result) => {
    return result;
  });

  console.log("Done");
  console.log("Inserting transactions to DB");

  const newColumnArray = columns
    .filter((col) => col !== "SN")
    .concat("PRODUCT")
    .concat("DIRECTION");

  let TotalInsertValues = ``;

  let BulkInsertValues = [];

  let interval = 1000;

  //Looping through JSON-Array from CSV File
  for (let i = 0; i < jsonArray.length; i++) {
    let TransactionObject = {
      ...jsonArray[i],
      PRODUCT,
      DIRECTION,
    };

    const items = Object.values(TransactionObject).slice(1);

    const FormattedValues = await FormatInsertValues(items);

    if (
      items.includes("'SESSION ID'") ||
      items.includes("'ORIGINATOR / BILLER'") ||
      items.includes("'AMOUNT'") ||
      items.includes("'TRANSACTION TYPE'") ||
      items.includes("'TRANSACTION VOLUME'") ||
      items.includes("'TOTAL AMOUNT (N)'")
    ) {
      //skip
    } else {
      if (FormattedValues.length === newColumnArray.length) {
        TotalInsertValues = TotalInsertValues + `(${FormattedValues}),\n`;
        if (i === interval) {
          BulkInsertValues.push([TotalInsertValues]);
          TotalInsertValues = ``;
          interval += 1000;
        }
      }
    }
  }

  BulkInsertValues.push([TotalInsertValues]);

  for (let i = 0; i < BulkInsertValues.length; i++) {
    const index = BulkInsertValues[i].toString().lastIndexOf(",");
    const QueryValue = BulkInsertValues[i].toString().slice(0, index);
    const InsertStatement = "INSERT INTO NIBSS VALUES\n" + QueryValue;
    await InsertToSQLDB(InsertStatement, i, BulkInsertValues[i]);
  }

  console.log("Done");
});
