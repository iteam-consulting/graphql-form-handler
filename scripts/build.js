
const webpack = require('webpack');
const beautify = require('json-beautify');
const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');
const config = require('../webpack.config');

webpack(config).run((err, stats) => {
  if (!err) {
    delete pkg.devDependencies;
    delete pkg.scripts;

    fs.writeFile(
      path.resolve(__dirname, '../build/package.json'),
      beautify(pkg, null, 2));

    fs.createReadStream('./README.md')
      .pipe(fs.createWriteStream('./build/README.md'));

    fs.createReadStream('./LICENSE')
      .pipe(fs.createWriteStream('./build/LICENSE'));
  }
});
