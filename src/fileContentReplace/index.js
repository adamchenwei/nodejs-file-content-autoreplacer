import fs from 'fs';
const PROJECT_ROOT_DIR = process.cwd();

function loopFiles(dirname, onFileContent, onError) {
  console.log(`
  ////////////////

  ////////////////AT DIR: ${dirname}

  ////////////////
  `)
  fs.readdir(dirname, function(err, filenames) {
    console.log(filenames);

    if (err) {
      onError(err, 'readdir level');
      return;
    }

    filenames.forEach(function(filename) {
      //ignore certain system files
      if (filename === '.DS_Store') {
        return;
      }

      console.log(`***************** AT filename: ${filename}`);
      const isDirectory = fs.lstatSync(`${dirname}/${filename}`).isDirectory();
      if (isDirectory) {
        console.log(`&&&&&&&&& isDirectory: true for ${filename}`)
        loopFiles(`${dirname}/${filename}`, onFileContent, onError);
      } else {
        //proceed only with matched files
        const isTestFile=filename.match(/\.test.js/i);
        if (isTestFile) {
          fs.readFile(`${dirname}/${filename}`, 'utf-8', function(err, content) {
            if (err) {
              onError(err, 'readFile level');
              return;
            }
            onFileContent(`${dirname}/${filename}`, content);
          });
        } else {
          console.log(`${filename} not a test file, skipped`);
        }

      }
    });

  });
}

function onLog(filename, content) {
  console.log(`
  -------------------- LOG BEG ---------------------------
  filename: ${filename}
  ---
  content: ${content}
  -------------------- LOG END ---------------------------
  `);
}

function onFileContentLoaded(filename, content) {
  let newContentArray = content.toString().split("\n");
  console.log(newContentArray);
  let lastImportLineIndex = null;
  //insert the third party import
  newContentArray.splice(1, 0, `import initStoryshots from '@storybook/addon-storyshots';`);

  for(let i=0;i<newContentArray.length; i+=1) {
    console.log('----->>> line')
    console.log( newContentArray[i].match(/\import/i) ? 'matched' : 'not match');
    if (newContentArray[i].match(/\import/i)) {
      lastImportLineIndex = i;
    };
  }

  //insert the execusion line
  newContentArray.splice(lastImportLineIndex+1, 0, `initStoryshots();`);
  const newContent = newContentArray.join('\n');
  fs.writeFile(filename, newContent, 'utf8', function (err) {
      console.log(`wrote new content to ${filename}`);
      if (err) return onError(err, 'onFileContentLoaded');
  });
  console.log(`onFileContentLoaded: ${filename}`);
  // const newResult = content + `import mything from 'something'\n`;
  // fs.writeFile(filename, newResult, 'utf8', function (err) {
  //     console.log(`wrote new content to ${filename}`);
  //     if (err) return onError(err, 'onFileContentLoaded');
  // });
}

function onError(error, type) {
  console.log(`
  !!!!!!!!!!!!!!!!!!!!!!!!!! ERROR BEG !!!!!!!!!!!!!!!!!!!!!!!!!!
  error of ${type}: ${error}
  !!!!!!!!!!!!!!!!!!!!!!!!!! ERROR END !!!!!!!!!!!!!!!!!!!!!!!!!!
  `);
}

console.log('start>>>>>>>>>>>>>>>>>> ASYNC!');
//LOCAL TEST
const SRC = `${PROJECT_ROOT_DIR}/src/fileContentReplace/resultStorage`;
//LIVE PRODUCTION!
//const SRC = `/Users/adamchenwei/www/dashboard2-central-web-client/src`;
console.log(`src folder: `)
loopFiles(SRC, onFileContentLoaded, onError);
console.log('done<<<<<<<<<<<<<<<<<<<');