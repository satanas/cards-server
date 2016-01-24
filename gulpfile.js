var gulp = require('gulp'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream');

gulp.task('build', function(done) {
  return browserify('./models/validator.js', {
      standalone: 'Validator'
    })
    .bundle()
    .pipe(source('validator.js'))
    .pipe(gulp.dest('./public/js/frontend/models'));
});
