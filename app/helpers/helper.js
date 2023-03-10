const CryptoJS = require("crypto-js");

// ENCRYPT TEXT
const encryptText = (text) => {
  try {
    return CryptoJS.AES.encrypt(text, process.env.SECRET_KEY).toString();
  } catch (error) {
    return error.message;
  }
};

// DECRYPT TEXT
const decryptText = (cipherText) => {
  try {
    return CryptoJS.AES.decrypt(cipherText, process.env.SECRET_KEY).toString(
      CryptoJS.enc.Utf8
    );
  } catch (error) {
    return error.message;
  }
};

// RANDOM UNIQUE CODE
function getUniqueCode() {
  const maxDate = Date.now();
  const timestamp = Math.floor(Math.random() * maxDate).toString();
  return timestamp;
}

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min) + 1;
}

function randomNumberInt() {
  const result = [];
  while (result.length !== 3) {
    let random = getRandomArbitrary(0, 9);
    if (!result.includes(random)) result.push(random);
    
    // To check if the first no is not zero
    if (result.length === 1 && random === 0) result.pop();
  }
  return parseInt( result.join("") );
}

module.exports = {
  encryptText,
  decryptText,
  getUniqueCode,
  randomNumberInt,
};
