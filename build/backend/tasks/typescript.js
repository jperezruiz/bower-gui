const gulp = require("gulp");
const ts = require("gulp-typescript");
const path = require("path");
const gutil = require("gulp-util");
//client
const config = require("./../config");
const tsProject = ts.createProject(path.resolve(config.src, "tsconfig.json"));
const tsFiles = [path.resolve(config.src, "**/*.ts"),path.resolve(config.src, "**/*.tsx")];
gulp.task("backend-typescript:build", function () {
    return gulp.src(tsFiles)
        .pipe(tsProject())
        .js.pipe(gulp.dest(config.src));
});
gulp.task('backend-typescript:watch', function () {
    gutil.log("Waiting for ts changes");
    gulp.watch(tsFiles, ['backend-typescript:build']);
});
