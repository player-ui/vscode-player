const path = require("path");
const Mocha = require("mocha");
const globby = require("globby");

// eslint-disable-next-line import/no-unassigned-import
require("./snapshot");

/** Entry for the vscode test runner */
async function run() {
  const mocha = new Mocha({
    ui: "tdd",
  });

  const tests = path.resolve(__dirname, "..");
  const files = await globby("**/*.test.js", { cwd: tests });

  files.forEach((f) => {
    mocha.addFile(path.resolve(tests, f));
  });

  return new Promise((resolve, reject) => {
    mocha.run((failures) => {
      if (failures > 0) {
        reject(new Error(`${failures} tests failed.`));
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  run,
};
