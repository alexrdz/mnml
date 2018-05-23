const marked = require('meta-marked');
const pug = require('pug');
const fs = require('fs');
const path = require('path');
const distDir = './dist';
const config = require('./config');
const sourceDir = path.join('./', config.sourceDir);
const pagesDir = path.join(sourceDir, config.pagesDir);

fs.readdir(pagesDir, (err, files) => {
  if (err) console.log('cannot read files: ', err);

  files.forEach(file => compileMarkdownAndWriteToFile(file));
});

function compileMarkdownAndWriteToFile(file) {
  const compiled = marked(fs.readFileSync(path.join(pagesDir, file)).toString());
  const fileNameWithoutExtension = getFileNameWithoutExtension(file);
  const template = path.join(path.join(sourceDir, `./templates/${compiled.meta.template}.pug`));
  
  fs.readFile(template, (err, data) => {
    if (err) throw err;
    
    const html = pug.compile(data)({body: compiled.html});
    
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir);
    }

    if(fileNameWithoutExtension === 'index') {
      return writeHTML(`./dist/index.html`, html);
    }

    if (!fs.existsSync(fileNameWithoutExtension)) {
      fs.mkdirSync(`./dist/${fileNameWithoutExtension}`);
    }
  
    return writeHTML(`./dist/${fileNameWithoutExtension}/index.html`, html);
  });
}

function writeHTML (fileName, data) {
  return fs.writeFile(fileName, data, (err) => {
    if (err) throw err;
  });
}

function getFileNameWithoutExtension (file) {
  const index = file.indexOf('.');
  
  return file.substr(0, index);
}

