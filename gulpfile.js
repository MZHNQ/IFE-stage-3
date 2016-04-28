var gulp     = require('gulp');

var htmlmin  = require('gulp-htmlmin');
var cleanCSS = require('gulp-clean-css');
var imagemin = require('gulp-imagemin');
var watch    = require('gulp-watch');
var cache    = require('gulp-cache');
var jshint   = require('gulp-jshint');
var uglyfly  = require('gulp-uglyfly');
var rename   = require('gulp-rename');
var del      = require('del');

var browserSync = require('browser-sync').create();

var paths = {
  html: '*/*.html',
  css: '*/*.css',
  js: 'task_*/*.js',
  images: '*/img/**/*'
};

var dst_dir = 'public';

gulp.task('clean', function () {
  return del([dst_dir]);
});


gulp.task('html', ['clean'], function () {
  return gulp.src(paths.html)
    .pipe(gulp.dest(dst_dir));
});


gulp.task('css', ['clean'], function () {
  return gulp.src(paths.css)
    .pipe(cleanCSS())
    .pipe(gulp.dest(dst_dir));
});


gulp.task('js', ['clean'], function () {
  return gulp.src(paths.js)
    .pipe(uglyfly())
    // .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(dst_dir));
});


gulp.task('images', ['clean'], function () {
  return gulp.src(paths.images)
    .pipe(cache(imagemin({optimizationLevel: 5})))
    .pipe(gulp.dest(dst_dir));
});



gulp.task('lint', function () {
  return gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('watch', function () {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });

  gulp.watch(paths.js, ['lint']);

  gulp.watch('task-*/**/*', function(){
    browserSync.reload();
  });
});


gulp.task('default', [ 'html', 'css', 'js', 'images']);