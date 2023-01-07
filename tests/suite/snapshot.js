const path = require("path");
const fs = require("fs");
const { expect } = require("expect");
const { SnapshotState, toMatchSnapshot } = require("jest-snapshot");

/** run the snapshot checks  */
function checkMatchSnapshot(actual, testFile, testTitle) {
  const snapshotDir = path.join(path.dirname(testFile), "__snapshots__");

  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir);
  }

  const snapshotFile = path.join(
    snapshotDir,
    `${path.basename(testFile)}.snap`
  );

  const snapshotState = new SnapshotState(snapshotFile, {
    updateSnapshot: process.env.SNAPSHOT_UPDATE ? "all" : "new",
  });

  const matcher = toMatchSnapshot.bind({
    snapshotState,
    currentTestName: testTitle,
  });

  const result = matcher(actual);
  snapshotState.save();
  return result;
}

/** get a title from the mocha test */
function makeTestTitle(test) {
  let next = test;
  const title = [];

  for (;;) {
    if (!next.parent) {
      break;
    }

    title.push(next.title);
    next = next.parent;
  }

  return title.reverse().join(" ");
}

// https://medium.com/blogfoster-engineering/how-to-use-the-power-of-jests-snapshot-testing-without-using-jest-eff3239154e5
expect.extend({
  toMatchSnapshot(actual, ctx) {
    if (!ctx || !ctx.test) {
      throw new Error("toMatchSnapshot() must be called from a test context.");
    }

    const { test } = ctx;

    // would contain the full path to test file
    const testFile = test.file;
    const testTitle = makeTestTitle(test);

    const result = checkMatchSnapshot(actual, testFile, testTitle);
    return result;
  },
});
