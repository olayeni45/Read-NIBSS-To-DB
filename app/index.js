//Imports
import sql from "mssql";
import {
  ssmsConfig,
  ReadNIBSSJSON,
  ReadCSV,
  columns,
  JSON_FILE,
  FormatInsertValues,
  DB_TABLE
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
const InsertToSQLDB = async (InsertStatement, index) => {
  try {
    await conn.query(InsertStatement, (error, recordSet) => {
      if (error) {
        console.log("Bulk Insert no: " + index);
        throw error;
      }
    });
  } catch (err) {
    console.log(err);
  }
};

//Insert Bulk Transactions to DB
const InsertBulkTransactionToDB = async (BulkTransactionArray) => {
  for (let i = 0; i < BulkTransactionArray.length; i++) {
    const item = BulkTransactionArray[i].toString();
    const index = item.lastIndexOf(",");
    const QueryValue = item.slice(0, index);
    const InsertStatement = "INSERT INTO " + DB_TABLE + " VALUES\n" + QueryValue;
    await InsertToSQLDB(InsertStatement, i);
  }
};

await ConnectToSQLDB();

//Close SQL DB Connection
const delay = 480_000;
const close_timeout =
  NIBSSJSONFile.length > 1 ? delay * (NIBSSJSONFile.length + 1) : 540_000;

//Settimeout
setTimeout(async () => {
  console.log("Closing SQL DB Connection");

  await conn.close();

  console.log("Connection closed.");
  console.log("End: ", new Date().toLocaleString())
}, close_timeout);

//Looping through each NIBSS file
const timer = (ms) => new Promise((res) => setTimeout(res, ms));

async function LoopFiles() {
  console.log("Start: ", new Date().toLocaleString())
  for (let i = 0; i < NIBSSJSONFile.length; i++) {
    const file = NIBSSJSONFile[i];
    console.log("--------------------------------------------------");

    const { Product: PRODUCT, Direction: DIRECTION, File: NIBSSFILE } = file;

    console.log("Current file ", NIBSSFILE);

    const { jsonArray, fileExists } = await ReadCSV(NIBSSFILE).then(
      (result) => {
        return result;
      }
    );

    if (fileExists) {
      console.log("Reading file into memory");

      console.log("Done");

      console.log("Inserting transactions to DB");

      const newColumnArray = columns
        .filter((col) => col !== "SN")
        .concat("PRODUCT")
        .concat("DIRECTION");

      let TotalInsertValues = ``;

      let BulkInsertValues = [];

      let interval = 700;

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
              TotalInsertValues = "";
              interval += 700;
            }
          }
        }
      }

      BulkInsertValues.push([TotalInsertValues]);

      try {
        await InsertBulkTransactionToDB(BulkInsertValues);
      } catch (error) {
        throw error;
      }
      await timer(delay);

      console.log("Done");

      NIBSSJSONFile.length > 1 &&
        i !== NIBSSJSONFile.length &&
        console.log("Next file...");
    }
  }
}

LoopFiles();
