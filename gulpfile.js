/***************************************************
 **                   Plugins                     **
 ***************************************************/

var gulp      = require("gulp"),
    clean     = require("gulp-clean"),
    concat    = require("gulp-concat"),
    csslint   = require("gulp-csslint"),
    jshint    = require("gulp-jshint"),
    minifyCSS = require("gulp-minify-css"),
    rename    = require("gulp-rename"),
    stylus    = require("gulp-stylus"),
    uglify    = require("gulp-uglify"),
    util      = require("gulp-util");




/***************************************************
 **                  Constants                    **
 ***************************************************/

var PROJECT_NAME     = "pickacolor";

var SRC_DIR          = "src/";
var SCRIPTS_SRC_DIR  = SRC_DIR;
var STYLES_SRC_DIR   = SRC_DIR + "styles/";
var IMAGES_SRC_DIR   = SRC_DIR + "images/";

var DIST_DIR         = "dist/";
var SCRIPTS_DIST_DIR = DIST_DIR;
var STYLES_DIST_DIR  = DIST_DIR + "styles/";
var IMAGES_DIST_DIR  = DIST_DIR + "images/";




/***************************************************
 **                    Tasks                      **
 ***************************************************/

gulp.task("default", [ "watch" ]);

gulp.task("watch", function () {
  gulp.watch(SCRIPTS_SRC_DIR + "*.js", [ "scripts" ]);
  gulp.watch(STYLES_SRC_DIR + "*.*", [ "styles" ]);
  gulp.watch(IMAGES_SRC_DIR + "*", [ "images" ]);
});


gulp.task("dist", [ "clean", "scripts", "styles", "images" ]);
gulp.task("lint", [ "lint-scripts" ]);
gulp.task("clean", [ "clean-scripts", "clean-styles", "clean-images" ]);


gulp.task("scripts", [ "clean-scripts", "lint-scripts" ], function () {
  return gulp.src(SCRIPTS_SRC_DIR + "*.js")
             .pipe(concat(PROJECT_NAME + ".js"))
             .pipe(gulp.dest(SCRIPTS_DIST_DIR))
             .pipe(rename(PROJECT_NAME + ".min.js"))
             .pipe(uglify({ mangle: false }))
             .pipe(gulp.dest(SCRIPTS_DIST_DIR));
});

gulp.task("lint-scripts", function () {
  return gulp.src(SCRIPTS_SRC_DIR + "*.js")
             .pipe(jshint())
             .pipe(jshint.reporter("jshint-stylish"));
});

gulp.task("clean-scripts", function () {
  return gulp.src("dist/*.js")
             .pipe(clean());
});


gulp.task("styles", [ "clean-styles" ], function () {
  return gulp.src(STYLES_SRC_DIR + "*.styl")
             .pipe(stylus())
             .pipe(concat(PROJECT_NAME + ".css"))
             .pipe(gulp.dest(STYLES_DIST_DIR))
             .pipe(rename(PROJECT_NAME + ".min.css"))
             .pipe(minifyCSS())
             .pipe(gulp.dest(STYLES_DIST_DIR));
});

gulp.task("clean-styles", function () {
  return gulp.src(STYLES_DIST_DIR + "*")
             .pipe(clean());
});



gulp.task("images", [ "clean-images" ], function () {
  return gulp.src(IMAGES_SRC_DIR + "*")
             .pipe(gulp.dest(IMAGES_DIST_DIR));
});

gulp.task("clean-images", function () {
  return gulp.src(IMAGES_DIST_DIR)
             .pipe(clean());
});