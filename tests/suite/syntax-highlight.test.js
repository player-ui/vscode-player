const { expect } = require("expect");
const path = require("path");
const fs = require("fs");
const { commands, Uri } = require("vscode");

const syntaxHighlightSampleDir = path.resolve(
  __dirname,
  "./syntax-highlight-samples"
);
const files = fs.readdirSync(syntaxHighlightSampleDir);

async function getColorTokens(filePath) {
  const data = await commands.executeCommand(
    "_workbench.captureSyntaxTokens",
    Uri.file(filePath)
  );
  return data;
}

suite("Syntax Highlight", () => {
  files.forEach((file) => {
    const filePath = path.join(syntaxHighlightSampleDir, file);
    // const fileContent = fs.readFileSync(filePath, 'utf8');
    test(`Syntax Highlight: ${file}`, async function () {
      expect(await getColorTokens(filePath)).toMatchSnapshot(this);
    });
  });
});
