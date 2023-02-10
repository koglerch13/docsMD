const { execSync } = require("child_process");
const fs = require("fs");

// run docsMD in the verification-test folder
console.log("Test basic generation.");
execSync("cd input && node ../../build/cli.js --output ../output --inline true");

if (!compareDirectory("output", "expected")) {
  console.log('Comparison failed');
  throw new Error();
}

if (!compareDirectory("expected", "output")) {
  console.log('Comparison failed');
  throw new Error();
}


function compareDirectory(dir1, dir2) {
  if (!isDirectory(dir1)) {
    console.log(`"${dir1}" is not a directory`);
    return false;
  }

  if (!isDirectory(dir2)) {
    console.log(`"${dir2}" is not a directory`);
    return false;
  }

  var dir1Contents = fs.readdirSync(dir1);

  for (const element of dir1Contents) {
    var dir1Path = `${dir1}/${element}`;
    var dir2Path = `${dir2}/${element}`;

    var existsInDir2 = fs.existsSync(dir2Path);
    if (!existsInDir2) {
      console.log(`"${dir2Path}" does not exist.`);
      return false;
    }

    var dir1ElementIsDirectory = isDirectory(dir1Path);
    if (dir1ElementIsDirectory) {
      var areSubdirectoriesEqual = compareDirectory(dir1Path, dir2Path);
      if (!areSubdirectoriesEqual) {
        return false;
      }

      continue;
    }

    var filesAreIdentical = areFilesIdentical(dir1Path, dir2Path);
    if (!filesAreIdentical) {
      console.log(`"${dir1Path}" and "${dir2Path}" are not identical.`);
      return false;
    }
  }

  return true;
}

function isDirectory(path) {
  return fs.lstatSync(path).isDirectory();
}

function areFilesIdentical(filePath1, filePath2) {
  var content1Buffer = fs.readFileSync(filePath1);
  var content2Buffer = fs.readFileSync(filePath2);

  return content1Buffer.toString() === content2Buffer.toString();
}