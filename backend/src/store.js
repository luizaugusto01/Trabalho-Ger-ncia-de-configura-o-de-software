const fs = require("node:fs");
const path = require("node:path");

const defaultDataPath = path.join(__dirname, "data.json");

function createStore(filePath = process.env.SACMED_DATA_FILE || defaultDataPath) {
  const resolvedPath = path.resolve(filePath);

  function read() {
    const raw = fs.readFileSync(resolvedPath, "utf8");
    return JSON.parse(raw);
  }

  function write(data) {
    fs.writeFileSync(resolvedPath, `${JSON.stringify(data, null, 2)}\n`);
  }

  return { read, write, filePath: resolvedPath };
}

module.exports = { createStore };
