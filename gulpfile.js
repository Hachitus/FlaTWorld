/* global require */
'use strict';

var gulp = require('gulp');
var rimraf = require('gulp-rimraf');
//var watch = require('gulp-watch')
var browserSync = require('browser-sync');
//var reload = browserSync.reload;
var concat = require("gulp-concat");
var babel = require("gulp-babel");
var sourcemaps = require("gulp-sourcemaps");
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
//var debug = require('gulp-debug');

var config = {
  entryFiles: [
    './src/components/map/core/init.js',
    './src/components/map/core/log.js',
    './src/components/utilities/polyfills.js',
    './src/components/utilities/general.js',
    './src/components/utilities/environment.js',
    './src/components/preloading/Preload.js',
    './src/components/map/core/utils/dataManipulation.js',
    './src/components/map/core/utils/effects.js',
    './src/components/map/core/utils/utils.js',
    './src/components/map/core/mapAPI.js',
    './src/components/map/core/mapEvents.js',
    './src/components/map/core/eventlisteners.js',
    './src/components/map/core/MapLayers.js',
    './src/components/map/core/MapDataManipulator.js',
    './src/components/map/core/UI.js',
    './src/components/map/core/ObjectManager.js',
    './src/components/map/core/Objects.js',
    './src/components/map/core/Sound.js',
    './src/components/map/core/mapStates.js',
    './src/components/map/core/UI.js',
    './src/components/map/core/UITemplateBase.js',
    './src/components/map/core/baseEventlisteners/*.js',
    './src/components/map/core/move/*.js',
    './src/components/map/core/zoom/*.js',
    './src/components/map/extensions/basicActions/*.js',
    './src/components/map/extensions/hexagons/init.js',
    './src/components/map/extensions/hexagons/utils/hexagonMath.js',
    './src/components/map/extensions/hexagons/utils/createHexagon.js',
    './src/components/map/extensions/hexagons/eventListeners/*.js',
    './src/components/map/extensions/hexagons/*.js',
    './src/components/map/extensions/mapMovement/mapMovement.js',
    './src/components/map/UIs/default/init.js',
    './src/components/map/UIs/default/utils/*.js',
    './src/components/map/UIs/default/layout/*.js',
    './src/components/map/UIs/default/default.js',
    './src/components/map/core/Flatworld.js',
    './src/factories/*.js'],
  cssFiles: ['./src/assets/lib/pace/css/loadingBar.css'],
  outputDir: './dist/',
  outputDirDev: './src/dist/',
  outputFile: 'flatworld.js'
};

gulp.task('deploy', ['clean', 'bundleLib', 'bundleCss', 'bundleProd']);

gulp.task('build', ['cleanDev', 'bundleLibDev', 'bundleCssDev', 'bundleDev']);

gulp.task('bundleProd', function() {
  return gulp.src(config.entryFiles)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('flatworld.min.js'))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(config.outputDir));
});

gulp.task('bundleLib', function() {
  return gulp.src('./src/assets/lib/**/*.js', { base: './src/assets/lib/' })
    .pipe(concat('flatworld_libraries.js'))
    .pipe(gulp.dest(config.outputDir));
});

gulp.task('bundleLibDev', function() {
  return gulp.src('./src/assets/lib/**/*.js', { base: './src/assets/lib/' })
    .pipe(concat('flatworld_libraries.js'))
    .pipe(gulp.dest(config.outputDirDev));
});

gulp.task('bundleDev', function() {
  return gulp.src(config.entryFiles)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('flatworld.js'))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(config.outputDirDev));
});

gulp.task('watch', function() {
  return gulp.watch(config.entryFiles, ['bundleDev']);
});

gulp.task('cleanDev', function(){
  return rimraf(config.outputDirDev);
});

gulp.task('clean', function(){
  return rimraf(config.outputDir);
});

gulp.task('bundleCss', function () {
  return gulp.src(config.cssFiles)
    .pipe(cssmin())
    .pipe(concat('flatworld.css'))
    .pipe(gulp.dest(config.outputDir + "css/"));
});

gulp.task('bundleCssDev', function () {
  return gulp.src(config.cssFiles)
    .pipe(concat('flatworld.css'))
    .pipe(gulp.dest(config.outputDirDev + "css/"));
});

gulp.task('develope', ['build', 'watch'], function() {
  return browserSync({
    server: {
      baseDir: './src/'
    },
    startPath: "tests/manualStressTest.html"
  });
});

gulp.task('default', ['deploy', 'build']);