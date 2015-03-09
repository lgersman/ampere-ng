var jasmine = require('minijasminenode2');

  // configure jasmine
var options = require( "./test-node-specs-options")();

if( process.argv[1].indexOf( 'build/es6/test')!==-1) {
  console.log( '(running tests with traceur as commonjs loader)');
    // es mode : declare traceur loader as commonjs loader
  require('traceur').require.makeDefault(
    function(filename) {
        // transpile everything
      return true;
    }, {
      experimental       : true,
      types              : true,
      typeAssertions     : true,
      typeAssertionModule: 'rtts-assert',
      annotations        : true,
    }
  );
} else {
  console.log( '(running tests compiled to commonjs)');
    // commonjs mode : load traceur runtime
  require( '../../../node_modules/traceur/bin/traceur-runtime.js');
}

process.chdir( __dirname + '/..');
jasmine.executeSpecs( options);
