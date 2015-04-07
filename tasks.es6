  /*
  * Advanced tips for using gulp.js : https://medium.com/@webprolific/getting-gulpy-a2010c13d3d5
  */

const gulp        = require('gulp'),
      del      = require('del'),
      es          = require('event-stream'),
      shell       = require('gulp-shell'),
      browserify  = require('browserify'),
      source      = require('vinyl-source-stream'),
      gzip        = require('gulp-gzip')
;

function promisify(stream) {
  return new Promise((resolve, reject)=>{
    stream.on('end', resolve).on('error', reject)
  });
}

gulp.task('clean', cb=>del(['./build', './dist'], cb));

gulp.task('prepare', ['clean'], ()=> {
  const dest = (path='')=>gulp.dest( `./build/${path}`);

  return es.merge(
    //gulp.src('./node_modules/traceur/bin/traceur-runtime.js').pipe(dest('lib/traceur')),
    gulp.src('./node_modules/rtts-assert/src/**/*.js').pipe(dest('es6/lib/assert')),
    gulp.src('./src/**/*.js').pipe(dest('es6/src')),
    gulp.src('./test/**/*.js').pipe(dest('es6/test'))
  );
});

gulp.task('build', ['prepare'], ()=>{
  var arr = [];
  return promisify(
    es.merge(
      ...[for(dir of ['lib/assert', 'src/', 'test/']) shell.task(`node_modules/traceur/traceur \
      --experimental \
      --array-comprehension=true \
      --type-assertions \
      --type-assertion-module ../lib/assert/assert \
      --modules commonjs \
      --debug \
      --dir ./build/es6/${dir} ./build/commonjs/${dir} \
      `)()]
    )).then(()=>promisify(
      shell.task(`mkdir ./build/browserify && \
        node_modules/.bin/browserify ./build/commonjs/src/ampere.js --standalone Ampere -d -o ./build/browserify/ampere.js && \
        \
        node_modules/.bin/sjs -m ./sweet-production.sjs ./build/browserify/ampere.js -o ./build/browserify/ampere-production.js && \
        \
        node_modules/.bin/browserify ./build/commonjs/src/ampere.js --standalone Ampere -d -g uglifyify -o ./build/browserify/ampere-uglifyify-min.js && \
        \
        node_modules/.bin/uglifyjs ./build/browserify/ampere.js -c -m > ./build/browserify/ampere-uglifyjs-min.js && \
        \
        node_modules/.bin/uglifyjs ./build/browserify/ampere-production.js -c -m > ./build/browserify/ampere-production-uglifyjs-min.js \
        \
      `)()
    ).then(()=>promisify(
       gulp.src('./build/browserify/*.js')
       .pipe(gzip())
       .pipe(gulp.dest('./build/browserify/'))
    )))
  }
);

gulp.task('test:node', ['build'], ()=>{
  return shell.task('node build/commonjs/test/test-node-specs.js -v')()
});

gulp.task('test', ['test:node'], cb=>{
  cb();
});

gulp.task('default', [ 'test'], (cb)=>console.log('Finished'));
