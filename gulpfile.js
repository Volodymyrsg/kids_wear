var gulp = require("gulp"),
plumber = require('gulp-plumber'), //Prevent pipe breaking caused by errors from gulp plugins.
postcss = require('gulp-postcss'),
autoprefixer = require('autoprefixer'),
less = require("gulp-less"),
cssnano = require("gulp-cssnano"),
jsuglify = require('gulp-uglify'),
pump = require('pump'), //Pipes streams together and destroys all of them if one of them closes.
concat = require('gulp-concat'), //Concatenates files.
sourcemaps = require("gulp-sourcemaps"),
sync = require("browser-sync").create(),
htmlExtend = require("gulp-html-extend"), //Extend, include and replace html files.
rename = require('gulp-rename'),
fontmin = require('gulp-fontmin'),
imagemin = require('gulp-imagemin'),
rimraf = require('rimraf'); //Deletes some files before running your build.

function onError(err) {
    console.log(err);
};

gulp.task('html:index', function() {
	return gulp.src('src/templates/**/*.html')
		.pipe(htmlExtend())
		.pipe(gulp.dest('dist/templates/'))
});

gulp.task('html:build', ['html:index']);
 
gulp.task('cssReset:build', function() {
	return gulp.src(['src/css/reset.css'])
	.pipe(sourcemaps.init())
	.pipe(cssnano())
	.pipe(sourcemaps.write())
  .pipe(postcss([ autoprefixer('> 5%', 'last 2 versions') ]))
	.pipe(rename({suffix: '.min'}))
	.pipe( plumber({ errorHandler: onError }) )
	.pipe(gulp.dest("dist/css"))
	.pipe(sync.stream())
});

gulp.task('cssCustom:build', function() {
	return gulp.src(['src/css/main.less'])
	.pipe(sourcemaps.init())
	.pipe(less())
	.pipe(cssnano())
	.pipe(sourcemaps.write())
  .pipe(postcss([ autoprefixer('> 5%', 'last 2 versions') ]))
	.pipe(rename('custom.min.css'))
	.pipe( plumber({ errorHandler: onError }) )
	.pipe(gulp.dest("dist/css"))
	.pipe(sync.stream())
});

gulp.task('cssVendor:build', function () {
  return gulp.src("src/css/vendor/*.css") // Берем папку vendor
		.pipe(cssnano())
		.pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/css'))
});
gulp.task('css:build', ['cssReset:build', 'cssCustom:build', 'cssVendor:build']); // билдим css целиком


gulp.task('minifyFont', function () {
  return gulp.src('src/fonts/*.ttf')
    .pipe(fontmin())
    .pipe(gulp.dest('dist/fonts'))
});
gulp.task('fontsCss:build', ['minifyFont'], function() {
  return gulp.src('src/css/font-style.css')
		.pipe(sourcemaps.init())
		.pipe(cssnano())
		.pipe(sourcemaps.write())
		.pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/css'))
});
gulp.task('font:build', ['minifyFont', 'fontsCss:build']);

gulp.task('logo-img:min', function() {
	return gulp.src('src/img/logo/*')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/img/logo'))
});
gulp.task('icons-img:min', function() {
	return gulp.src('src/img/icons/*')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/img/icons'))
});
gulp.task('content-img:min', function() {
	return gulp.src('src/img/content/*')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/img/content'))
});
gulp.task('slider-img:min', function() {
	return gulp.src('src/img/slider/*')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/img/slider'))
});

gulp.task('images:build', ['logo-img:min', 'icons-img:min',
 'content-img:min', 'slider-img:min']);

gulp.task('jsOwn:build', function() {
	return gulp.src([
		'src/js/custom.js',
		'src/js/jquery.sliderPro.js'
	])
	.pipe(concat('all.js'))
	.pipe(sourcemaps.init())
	.pipe(jsuglify())
	.pipe(sourcemaps.write())
	.pipe(rename('custom.min.js'))
	.pipe(gulp.dest('dist/js'))
});
gulp.task('jsVendor:build', function() {
	return gulp.src('node_modules/jquery/dist/jquery.min.js')
	// .pipe(sourcemaps.init())
	// .pipe(jsuglify())
	// .pipe(sourcemaps.write())
	// .pipe(concat('vendor.min.js'))
	.pipe(gulp.dest('dist/js'))
});
gulp.task('js:build', ['jsOwn:build', 'jsVendor:build']);

gulp.task('clear', function(cb) {
    rimraf('dist', cb);
});

gulp.task("build", ["html:build", "fontsCss:build", "css:build", "images:build"]);

gulp.task('watch', ["build"], function() {
	sync.init({
		server: {
			baseDir: "dist",
			index: "dist/templates/rendering/home/pt_home.html"
		}
	});
	gulp.watch('src/*.html', ['html:build']);
	gulp.watch('src/**/*{.less, .css}', ['css:build']);
	gulp.watch('src/fonts/*.ttf', ['font:build']);
	gulp.watch('src/images/*.*', ['images:build']);
	gulp.watch('src/js/*.js', ['js:build']);

	gulp.watch('dist/**/*.html').on('change', sync.reload);
	gulp.watch('dist/css/custom.min.css').on('change', sync.reload);
	gulp.watch('dist/js/*.js').on('change', sync.reload);
});

gulp.task("default", ["watch"]);
