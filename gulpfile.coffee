#**********************************************#
#                   Plugins                    #
#**********************************************#

gulp       = require 'gulp'
bump       = require 'gulp-bump'
clean      = require 'gulp-clean'
coffee     = require 'gulp-coffee'
coffeelint = require 'gulp-coffeelint'
concat     = require 'gulp-concat'
csslint    = require 'gulp-csslint'
jshint     = require 'gulp-jshint'
minifyCSS  = require 'gulp-minify-css'
rename     = require 'gulp-rename'
stylus     = require 'gulp-stylus'
uglify     = require 'gulp-uglify'
util       = require 'gulp-util'




#**********************************************#
#                  Constants                   #
#**********************************************#

PROJECT_NAME      = "pickacolor"

BUILD_DIR         = "build/"
DIST_DIR          = "dist/"
SRC_DIR           = "src/"
TEMP_DIR          = "tmp/"

COFFEE_SRC_DIR    = SRC_DIR
COFFEE_TEMP_DIR   = "#{TEMP_DIR}coffee/"

IMAGES_BUILD_DIR  = "#{BUILD_DIR}images/"
IMAGES_DIST_DIR   = "#{DIST_DIR}images/"
IMAGES_SRC_DIR    = "#{SRC_DIR}images/"
IMAGES_TEMP_DIR   = "#{TEMP_DIR}images/"

SCRIPTS_BUILD_DIR = BUILD_DIR
SCRIPTS_DIST_DIR  = DIST_DIR
SCRIPTS_SRC_DIR   = SRC_DIR
SCRIPTS_TEMP_DIR  = "#{TEMP_DIR}scripts/"

STYLES_BUILD_DIR  = "#{BUILD_DIR}styles/"
STYLES_DIST_DIR   = "#{DIST_DIR}styles/"
STYLES_SRC_DIR    = "#{SRC_DIR}styles/"
STYLES_TEMP_DIR   = "#{TEMP_DIR}styles/"




#**********************************************#
#                    Tasks                     #
#**********************************************#

gulp.task 'default', [ 'watch' ]
gulp.taks 'ci',      [ 'lint', 'dist' ]
gulp.task 'lint',    [ 'lint-scripts' ]
gulp.task 'clean',   [ 'clean-scripts', 'clean-styles', 'clean-images' ]
gulp.task 'build',   [ 'build-scripts', 'build-styles', 'build-images' ]
gulp.task 'rebuild', [ 'rebuild-scripts', 'rebuild-styles', 'rebuild-images' ]
gulp.task 'dist',    [ 'dist-scripts', 'dist-styles', 'dist-images' ]
# TODO: gulp.task 'publish', ...



gulp.task 'watch', () ->
  gulp.watch "#{SCRIPTS_SRC_DIR}*.js", [ 'build-scripts' ]
  gulp.watch "#{STYLES_SRC_DIR}*.*",   [ 'build-styles'  ]
  gulp.watch "#{IMAGES_SRC_DIR}*",     [ 'build-images'  ]



gulp.task 'lint-scripts', [ 'lint-coffee', 'lint-js' ]

gulp.task 'lint-coffee', () ->
  gulp.src "#{SCRIPTS_SRC_DIR}*.coffee"
      .pipe coffeelint()
      .pipe coffeelint.reporter('coffeelint-stylish')

gulp.task 'lint-js', () ->
  gulp.src "#{SCRIPTS_SRC_DIR}*.js"
      .pipe jshint()
      .pipe jshint.reporter('jshint-stylish')



gulp.task 'clean-scripts', () ->
  gulp.src "#{DIST_DIR}*.js"
      .pipe clean()

gulp.task 'clean-styles', () ->
  gulp.src "#{STYLES_DIST_DIR}*"
      .pipe clean()

gulp.task 'clean-images', () ->
  gulp.src IMAGES_DIST_DIR
      .pipe clean()



gulp.task 'build-scripts', [ 'build-coffee' ], () ->
  gulp.src "#{SCRIPTS_SRC_DIR}*.js"
      .pipe gulp.dest(SCRIPTS_BUILD_DIR)

gulp.task 'build-coffee', () ->
  gulp.src "#{COFFEE_SRC_DIR}*.coffee"
      .pipe coffee()
      .pipe gulp.dest(SCRIPTS_BUILD_DIR)

gulp.task 'rebuild-scripts', [ 'clean-scripts', 'build-scripts' ]

gulp.task 'dist-scripts', [ 'rebuild-scripts' ], () ->
  gulp.src "#{SCRIPTS_BUILD_DIR}*.js"
      .pipe concat("#{PROJECT_NAME}.js")
      .pipe gulp.dest(SCRIPTS_DIST_DIR)
      .pipe rename("#{PROJECT_NAME}.min.js")
      .pipe uglify({ mangle: false, preserveComments: 'some' })
      .pipe gulp.dest(SCRIPTS_DIST_DIR)



gulp.task 'build-styles', () ->
  gulp.src "#{STYLES_SRC_DIR}*.styl"
      .pipe stylus()
      .pipe gulp.dest(STYLES_BUILD_DIR)

gulp.task 'rebuild-styles', [ 'clean-styles', 'build-styles' ]

gulp.task 'dist-styles', [ 'rebuild-styles' ], () ->
  gulp.src "#{STYLES_BUILD_DIR}*.css"
      .pipe concat("#{PROJECT_NAME}.css")
      .pipe gulp.dest(STYLES_DIST_DIR)
      .pipe rename("#{PROJECT_NAME}.min.css")
      .pipe minifyCSS({ keepSpecialComments: '*' })
      .pipe gulp.dest(STYLES_DIST_DIR)



gulp.task 'build-images', () ->
  gulp.src "#{IMAGES_SRC_DIR}*"
      .pipe gulp.dest(IMAGES_BUILD_DIR)

gulp.task 'rebuild-images', [ 'clean-images', 'build-images' ], () ->

gulp.task 'dist-images', [ 'rebuild-images' ], () ->
  gulp.src "#{IMAGES_BUILD_DIR}*"
      .pipe gulp.dest(IMAGES_DIST_DIR)



gulp.task 'up-ver', [ 'update-version' ]

gulp.task 'update-version', () ->
  gulp.src [ './package.json', './bower.json' ]
      .pipe bump()
      .pipe gulp.dest('./')