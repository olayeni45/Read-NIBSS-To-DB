/*Regex Manipulations
  Columns -> SESSION_ID & Narration
*/

//Session ID Regex
const SessionIDRegex = /^'[0-9].*$/;

//First Regex
const FirstRegex = /^.*'[a-zA-Z] .*$/i;
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
const FifthRegex = /^.*'[a-zA-Z].*$/i;

//Sixth Regex
const SixthRegex = /^.*[a-zA-Z]'.*$/i;

export {
  SessionIDRegex,
  FirstRegex,
  RemovedApostropheString,
  DoubleApostropheRegex,
  DoubleApostropheRegexString,
  ThirdRegex,
  ThirdRegexString,
  FourthRegex, 
  FifthRegex, 
  SixthRegex
};
