/*Regex Manipulations
  Columns -> SESSION_ID & Narration

  Unused Regex:
  const FirstRegex = /^.*'[a-zA-Z] .*$/i;
  const FifthRegex = /^.*'[a-zA-Z].*$/i;
  const SixthRegex = /^.*[a-zA-Z]'.*$/i;
*/

//Session ID Regex
const SessionIDRegex = /^'[0-9].*$/;

//First Regex
const RemovedApostropheString = (str) => str.replace("'", "");

//Second Regex
const DoubleApostropheRegex = /^.*''.*$/i;
const DoubleApostropheRegexString = (str) => {
  return (
    str.slice(0, str.indexOf("'")) +
    " " +
    str.slice(str.indexOf("'") + 2, str.length)
  );
};

//Third Regex
const ThirdRegex = /^.*'[a-zA-Z]'.*$/i;
const ThirdRegexString = (str) => {
  return (
    str.slice(0, str.indexOf("'")) +
    str.slice(str.indexOf("'") + 1, str.indexOf("'") + 2) +
    str.slice(str.indexOf("'") + 3, str.length)
  );
};

//Fourth Regex
const FourthRegex = /^'[a-zA-Z].*$/;

//Fifth Regex
const TwoApostropheRegex = /^.*'.*'.*\s+.*$/i
const RemoveTwoApostrophesRegex = (str) => {
  return str.replaceAll("'", "");
};

export {
  SessionIDRegex,
  RemovedApostropheString,
  DoubleApostropheRegex,
  DoubleApostropheRegexString,
  ThirdRegex,
  ThirdRegexString,
  FourthRegex,
  TwoApostropheRegex,
  RemoveTwoApostrophesRegex,
};



/*
  import {
  SessionIDRegex,
  RemovedApostropheString,
  DoubleApostropheRegex,
  DoubleApostropheRegexString,
  ThirdRegex,
  ThirdRegexString,
  FourthRegex,
  TwoApostropheRegex,
  RemoveTwoApostrophesRegex,
  } from "./regex.js";

   const noOfApostrophe = str.replace(/[^']/g, "").length;

    const boolRemoveApostrophe =
      (str.indexOf("'") !== 0 || str.indexOf("'") !== str.length) &&
      noOfApostrophe === 1;

    //Session ID & First Regex & Fifth Regex
    if (SessionIDRegex.test(str) || boolRemoveApostrophe) {
      items[i] = RemovedApostropheString(str);
    }

    //Second Regex
    if (DoubleApostropheRegex.test(str)) {
      items[i] = DoubleApostropheRegexString(str);
    }

    //Third Regex
    if (ThirdRegex.test(str)) {
      items[i] = ThirdRegexString(str);
    }

    //Fouth Regex
    if (FourthRegex.test(str)) {
      items[i] = "'" + RemovedApostropheString(str) + "'";
    }

   //Default
    else {
      items[i] = "'" + items[i] + "'";
    }
  }
  return items;
*/
