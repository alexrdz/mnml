const marked = require('meta-marked');
const pug = require('pug');
const handlebars = require('handlebars');
const ejs = require('ejs');
const engines = {pug, handlebars, ejs};
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const ncp = require('ncp');
const connect = require('connect');
const serveStatic = require('serve-static');

const config = require('./config');
const distDir = path.join('./', config.distDir || 'dist');
const sourceDir = path.join(__dirname, config.sourceDir || 'src');
const templateEngine = config.templateEngine || 'pug';
const pagesDir = path.join(sourceDir, config.pagesDir || 'pages');
const assets = path.join(sourceDir, config.assetsDir || 'assets');
const watcher = chokidar.watch(sourceDir, {
  ignored: /(^|[\/\\])\../,
  persistent: true
});

watcher
  .on('error', error => console.log(`Watcher error: ${error}`))
  .on('ready', () => console.log('Initial scan complete. Ready for changes'))
  .on('change', (path) => {
    init();
  })
  .add(`${sourceDir}/**/*`);

function init () {
  fs.readdir(pagesDir, (err, files) => {
    if (err) console.log('cannot read files: ', err);
  
    files.forEach(file => compileMarkdownAndWriteToFile(file));
  });
}

function compileMarkdownAndWriteToFile (file) {
  const data = marked(fs.readFileSync(path.join(pagesDir, file)).toString());
  const fileNameWithoutExtension = getFileNameWithoutExtension(file);
  
  if (data.meta) {
    const templateName = data.meta.template;
    const templateFile = `./templates/${data.meta.template}.${templateEngine}`;
    const template = path.join(sourceDir, templateFile);
    
    createHTMLFile(template, data, fileNameWithoutExtension);
  }
}

function writeHTML (fileName, fileData) {
  return fs.writeFile(fileName, fileData, (err) => {
    if (err) throw err;
  });
}

function getFileNameWithoutExtension (file) {
  const index = file.indexOf('.');
  
  return file.substr(0, index);
}

function getFileExtension (file) {
  const index = file.indexOf('.');

  return file.substring(index);
}

function createHTMLFile (template, data, fileNameWithoutExtension) {
  fs.readFile(template, (err, fileData) => {

    if (err) {
      console.log(`cannot read file ${template}: `, err);
      return;
    }
    
    const html = engines[templateEngine].compile(fileData, {filename: template})({data});
    
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir);
    }

    if (fileNameWithoutExtension === 'index') {
      return writeHTML(`${distDir}/index.html`, html);
    }

    if (!fs.existsSync(`${distDir}/${fileNameWithoutExtension}`)) {
      fs.mkdirSync(`${distDir}/${fileNameWithoutExtension}`);
    }

    moveAssets();    
  
    return writeHTML(`${distDir}/${fileNameWithoutExtension}/index.html`, html);
  });      
}

function moveAssets () {
  ncp.limit = 16;
  const assetsDest = path.join(distDir, config.assetsDir);
  
  if (!fs.existsSync(assetsDest)) {
    fs.mkdirSync(assetsDest);
  }
 
  ncp(assets, assetsDest, function (err) {
    if (err) {
      return console.error(err);
    }
    
    return console.log('assets successfully copied');
  });
}

const serverPath = path.join(__dirname, distDir);
connect().use(serveStatic(serverPath)).listen(8000, function() {
  init();
  console.log('Server running on 8000... http://localhost:8000');
});

module.exports = {
  compileMarkdownAndWriteToFile,
  writeHTML,
  getFileNameWithoutExtension
}