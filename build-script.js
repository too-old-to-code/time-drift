'use strict';

var path = require('path')
var fs = require('fs')
var browserify = require('browserify')
var uglify = require('uglifyify')
var distRoot = path.join(__dirname, 'dist')
var bundlePath = path.join(distRoot, 'time-drift.js')
var bundlePathMin = path.join(distRoot, 'time-drift.min.js')

browserify({ debug: true }, {standalone: 'timeDrift'})
  .transform("babelify", {presets: ["@babel/preset-env"]})
  .require(require.resolve('./src/time-drift.js'), { entry: true })
  .bundle()
  .on('error', function (err) { console.error(err); })
  .pipe(fs.createWriteStream(bundlePath));

browserify({ debug: true }, {standalone: 'timeDrift'})
  .transform("babelify", {presets: ["@babel/preset-env"]})
  .transform(uglify, { global: true})
  .require(require.resolve('./src/time-drift.js'), { entry: true })
  .bundle()
  .on('error', function (err) { console.error(err); })
  .pipe(fs.createWriteStream(bundlePathMin));
