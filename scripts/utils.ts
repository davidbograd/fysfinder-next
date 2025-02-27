const dotenvLib = require("dotenv");
const pathLib = require("path");
const fsLib = require("fs");

module.exports = {
  config: dotenvLib.config,
  resolve: pathLib.resolve,
  join: pathLib.join,
  existsSync: fsLib.existsSync,
  mkdirSync: fsLib.mkdirSync,
  writeFileSync: fsLib.writeFileSync,
};
