var jasmine = require('minijasminenode2');

require('babel/register')({
  //extensions: ['.es6'],
  stage  : 0,
  plugins: ['typecheck']
});

  // load jasmine configuration
var options = require('./test-node-specs-options');

process.chdir(__dirname + '/..');
jasmine.executeSpecs(options);
