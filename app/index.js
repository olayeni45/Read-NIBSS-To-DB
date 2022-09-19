//Imports
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

  for (let i = 0; i < jsonArray.length; i++) {
    const TransactionObject = {
      ...jsonArray[i],
      PRODUCT,
      DIRECTION,
    };

    delete TransactionObject["SN"];

    const items = Object.values(TransactionObject);
    const newColumnArray = columns
      .filter((col) => col !== "SN")
      .concat("PRODUCT, DIRECTION");
    const FormattedValues = await FormatInsertValues(items);

    const InsertStatement =
      "INSERT INTO NIBSS(" +
      newColumnArray +
      ")\nVALUES (" +
      FormattedValues +
      ")";

    if (
      items.includes("SESSION ID") ||
      items.includes("ORIGINATOR / BILLER") ||
      items.includes("AMOUNT")
    ) {
      //skip
    } else {
      conn.query(InsertStatement, (error, recordSet) => {
        if (error) {
          console.log(items);
          console.log(InsertStatement);
          throw error;
        }
      });
    }
  }
});
