#**********************************************#
#                   Plugins                    #
#**********************************************#

gulp        = require 'gulp'
bower       = require 'gulp-bower'
bowerFiles  = require 'gulp-bower-files'
bump        = require 'gulp-bump'
clean       = require 'gulp-clean'
coffee      = require 'gulp-coffee'
coffeelint  = require 'gulp-coffeelint'
concat      = require 'gulp-concat'
csslint     = require 'gulp-csslint'
es          = require 'event-stream'
jshint      = require 'gulp-jshint'
minifyCSS   = require 'gulp-minify-css'
rename      = require 'gulp-rename'
replace     = require 'gulp-replace'
runSequence = require 'run-sequence'
stylus      = require 'gulp-stylus'
uglify      = require 'gulp-uglify'
util        = require 'gulp-util'
zip         = require 'gulp-zip'




#**********************************************#
#                  Constants                   #
#**********************************************#

PROJECT_NAME      = "pickacolor"


BOWER_JSON_PATH   = "./bower.json"
BOWER_OUT_DIR     = "./bower_components"

NPM_JSON_PATH     = "./package.json"

LICENSE_PATH      = "./LICENSES"
README_PATH       = "./README.md"


BUILD_DIR         = "build/"
DIST_DIR          = "dist/"
SRC_DIR           = "src/"

IMAGES_BUILD_DIR  = "#{BUILD_DIR}images/"
IMAGES_DIST_DIR   = "#{DIST_DIR}images/"
IMAGES_SRC_DIR    = "#{SRC_DIR}images/"

SCRIPTS_BUILD_DIR = BUILD_DIR
SCRIPTS_DIST_DIR  = DIST_DIR
SCRIPTS_SRC_DIR   = SRC_DIR

COFFEE_BUILD_DIR  = SCRIPTS_BUILD_DIR
COFFEE_SRC_DIR    = SRC_DIR

STYLES_BUILD_DIR  = "#{BUILD_DIR}styles/"
STYLES_DIST_DIR   = "#{DIST_DIR}styles/"
STYLES_SRC_DIR    = "#{SRC_DIR}styles/"




#**********************************************#
#                    Tasks                     #
#**********************************************#

gulp.task 'default', [ 'build' ]
gulp.task 'ci',      () -> runSequence 'lint', 'dist'
gulp.task 'lint',    () -> runSequence 'lint-js', 'lint-coffee'
gulp.task 'build',   () -> runSequence 'build-coffee', 'build-js', 'build-styles', 'build-images'
gulp.task 'rebuild', () -> runSequence 'clean-build', 'build'



# ---- Cleaning Tasks ---- #

gulp.task 'clean',   [ 'clean-build', 'clean-dist' ]


gulp.task 'clean-build', () ->
  gulp.src "#{BUILD_DIR}**/*"
      .pipe clean()


gulp.task 'clean-dist', () ->
  gulp.src "#{DIST_DIR}**/*"
      .pipe clean()


gulp.task 'clean-dep', () ->
  gulp.src BOWER_OUT_DIR
      .pipe clean()



# ---- Distribution Tasks ---- #

gulp.task 'dist', () -> runSequence 'clean', 'dist-scripts', 'dist-styles', 'dist-images', 'up-ver','dist-zip'


gulp.task 'dist-zip', () ->
  gulp.src [ "#{DIST_DIR}**/*", LICENSE_PATH, README_PATH ]
      .pipe zip("#{PROJECT_NAME}-#{require(BOWER_JSON_PATH).version}.zip")
      .pipe gulp.dest(DIST_DIR)



# ---- Dependency Resolution Tasks ---- #

gulp.task 'reinst-dep', () -> runSequence 'clean-dep', 'inst-dep'


gulp.task 'inst-dep', () ->
  bower()



# ---- CoffeeScript Tasks ---- #

gulp.task 'lint-coffee', () ->
  gulp.src "#{SCRIPTS_SRC_DIR}*.coffee"
      .pipe coffeelint()
      .pipe coffeelint.reporter()
      .pipe coffeelint.reporter('fail')


gulp.task 'build-coffee', [ 'lint-coffee' ], () ->
  gulp.src "#{COFFEE_SRC_DIR}*.coffee"
      .pipe coffee()
      .pipe gulp.dest(COFFEE_BUILD_DIR)



# ---- JavaScript Tasks ---- #

gulp.task 'lint-js', ()->
  gulp.src "#{SCRIPTS_SRC_DIR}*.js"
      .pipe jshint()
      .pipe jshint.reporter('jshint-stylish')
      .pipe jshint.reporter('fail')


gulp.task 'build-js', [ 'lint-js' ], () ->
  gulp.src "#{SCRIPTS_SRC_DIR}*.js"
      .pipe gulp.dest(SCRIPTS_BUILD_DIR)



# ---- Scripts Tasks ---- #

gulp.task 'dist-scripts', [ 'build-coffee', 'build-js' ], () ->
  gulp.src "#{SCRIPTS_BUILD_DIR}*.js"
      .pipe concat("#{PROJECT_NAME}.js")
      .pipe gulp.dest(SCRIPTS_DIST_DIR)
      .pipe rename("#{PROJECT_NAME}.min.js")
      .pipe uglify({ mangle: false, preserveComments: 'some' })
      .pipe gulp.dest(SCRIPTS_DIST_DIR)



# ---- Styles Tasks ---- #

gulp.task 'build-styles', () ->
  gulp.src "#{STYLES_SRC_DIR}*.styl"
      .pipe stylus()
      .pipe gulp.dest(STYLES_BUILD_DIR)


gulp.task 'dist-styles', [ 'build-styles' ], () ->
  gulp.src "#{STYLES_BUILD_DIR}*.css"
      .pipe concat("#{PROJECT_NAME}.css")
      .pipe gulp.dest(STYLES_DIST_DIR)
      .pipe rename("#{PROJECT_NAME}.min.css")
      .pipe minifyCSS({ keepSpecialComments: '*' })
      .pipe gulp.dest(STYLES_DIST_DIR)



# ---- Images Tasks ---- #

gulp.task 'build-images', () ->
  gulp.src "#{IMAGES_SRC_DIR}*"
      .pipe gulp.dest(IMAGES_BUILD_DIR)


gulp.task 'dist-images', [ 'build-images' ], () ->
  gulp.src "#{IMAGES_BUILD_DIR}*"
      .pipe gulp.dest(IMAGES_DIST_DIR)



# ---- Versioning Tasks ---- #

gulp.task 'up-ver', () ->
  es.merge(
    gulp.src [ BOWER_JSON_PATH, NPM_JSON_PATH ]
        .pipe bump()
        .pipe gulp.dest('./')
    gulp.src [ "#{DIST_DIR}**/*.js", "#{DIST_DIR}**/*.css" ]
        .pipe replace(/#VERSION#/g, require(BOWER_JSON_PATH).version)
        .pipe gulp.dest(DIST_DIR)
  )