'use strict';
const config = require("./../config");
const gulp = require('gulp');
const clean = require("gulp-clean");
gulp.task('backend-clean-dist', function () {
    return gulp.src(config.dist)
        .pipe(clean({force: true}));
});