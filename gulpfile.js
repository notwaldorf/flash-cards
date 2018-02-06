const gulp = require('gulp');

gulp.task('copy', function () {
  gulp.src(['./**/*', '!dist/', , '!dist/**', '!test/', , '!test/**']).pipe(gulp.dest('./dist'));
});
