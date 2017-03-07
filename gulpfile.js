var gulp = require('gulp');
var browserSync = require('browser-sync');

gulp.task('browser-sync', function() {
    browserSync.init({
        browser:"chrome",
        server: {
            index: "index.html"
        }
    });
});

gulp.task('default', ['browser-sync'], function () {
    gulp.watch("*.html", browserSync.reload);
    gulp.watch("*.css", browserSync.reload);
    gulp.watch("*.js", browserSync.reload);
});