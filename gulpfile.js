'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const babelify = require('babelify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const minify = require('gulp-clean-css');
const gutil = require('gulp-util');
const reload = require('gulp-livereload');
const nodemon = require('nodemon');
const gulpif = require('gulp-if');
const minimist = require('minimist');
const bs = require('browser-sync').create();
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');

const SERVER = 'index.js';
const DIST_DIRECTORY = './static/dist';
const SCSS_DIRECTORY = './scss/**/*.scss';
const JAVASCRIPT_DIRECTORY = './js/**/*.js';
const JAVASCRIPT_APP = './js/app.js';

const knownOptions = {
  string: [
    'live',
    'env'
  ]
};

const options = minimist(process.argv.slice(2), knownOptions);

/*
    Compile and minify Javascript with source maps using babel and riot transforms. All "es2015" functions are supported.
*/

gulp.task('javascript', function javascript (done) {
  return browserify({
    entries: JAVASCRIPT_APP,
    debug: true,
    paths: ['./node_modules', './js']
  })
    .transform(babelify.configure({ presets: ['@babel/preset-env'] }))
    .bundle()
    .on('error', notify.onError('Error: <%= error.message %>'))
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(gulpif(options.env !== 'production', sourcemaps.init({ loadMaps: true })))
    .pipe(uglify())
    .pipe(gulpif(options.env !== 'production', sourcemaps.write('./')))
    .pipe(gulp.dest(`${DIST_DIRECTORY}/js/`))
    .pipe(gulpif(options.env !== 'production' && options.live === 'true', bs.reload({ stream: true })));
});

/*
    Compile and minify SCSS with source maps.
*/

gulp.task('stylesheet', function stylesheet () {
  return gulp.src(SCSS_DIRECTORY)
    .pipe(plumber({
      errorHandler: notify.onError({
        message: 'Error: <%= error.message %>',
        sound: 'Submarine' // deactivate sound?
      })
    }))
    .pipe(gulpif(options.env !== 'production', sourcemaps.init()))
    .pipe(sass({
      includePaths: ['node_modules/foundation-sites/scss']
    }))
    .pipe(autoprefixer({
      cascade: false,
      flexbox: true,
      remove: false
    }))
    .on('error', gutil.log)
    .pipe(minify())
    .pipe(gulpif(options.env !== 'production', sourcemaps.write('./')))
    .pipe(gulp.dest(`${DIST_DIRECTORY}/css/`))
    .pipe(gulpif(options.env !== 'production' && options.live === 'true', bs.reload({ stream: true })));
});

/*
    Watch the SCSS, JAVASCRIPT, and VIEWS directories
*/

gulp.task('watch', function () {
  gulp.watch([SCSS_DIRECTORY], ['stylesheet']);
  gulp.watch(JAVASCRIPT_DIRECTORY, ['javascript']);
});

gulp.task('bs-watch', ['browser-sync'], function () {
  gulp.watch([SCSS_DIRECTORY], ['stylesheet']);
  gulp.watch(JAVASCRIPT_DIRECTORY, ['javascript']);
  gulp.watch('./views/*.hbs').on('change', bs.reload);
});

gulp.task('browser-sync', ['stylesheet'], function () {
  bs.init({
    proxy: 'localhost:3000'
  });
});

/*
    Run the server script
*/

gulp.task('server', function () {
  nodemon({ script: SERVER, ignore: ['./static', './js', '**/node_modules/**/*'] }).once('exit', function () {
    process.exit();
  });
});

/*
  Default gulp tasks compiles all assets, runs the server and watches folders for changes
*/

gulp.task('default', ['javascript', 'stylesheet', 'server', 'watch']);

gulp.task('bs', ['javascript', 'stylesheet', 'server', 'bs-watch']);

/*
    Build all assets
*/

gulp.task('build', ['javascript', 'stylesheet']);

process.on('uncaughtException', function (err) {
  console.log(err);
  return process.exit();
});

process.stdout.on('close', function () {
  return process.exit();
});
