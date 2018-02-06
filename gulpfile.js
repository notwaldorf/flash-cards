const gulp = require('gulp');

gulp.task('copy', function () {
  gulp.src(['./**/*']).pipe(gulp.dest('./dist'));
});
