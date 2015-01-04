  /*
  * gulp bootstrap file
  */

//require( './node_modules/traceur/bin/traceur-runtime.js');

require('traceur').require.makeDefault(
  function(filename) {
      // only transpile tasks.js
    return filename.endsWith('tasks.js');
  }, {
    experimental       : true,
    arrayComprehension : true//,    // bug in traceur 0.0.72, must be explicitly set to true (its experimental, si it should be on by default)
    //types              : true,
    //typeAssertions     : true,
    //typeAssertionModule: 'rtts-assert',
    //annotations        : true,
  }
);

require('./tasks.js');
