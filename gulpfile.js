"use strict";
const gulp 				 = require("gulp");
const sass 				 = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS     = require('gulp-clean-css');
const concat       = require('gulp-concat');
const clean        = require('gulp-clean');
const uglify       = require('gulp-uglify');
const plumber      = require('gulp-plumber');
const notify       = require('gulp-notify');
const sourcemaps   = require('gulp-sourcemaps');
const wiredep      = require('wiredep').stream;
const	spritesmith  = require('gulp.spritesmith');
const	merge        = require('merge-stream');
const browserSync  = require('browser-sync').create();



gulp.task('default', ['watch']);


gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "app"
        }
        // notify: false
    });
});

// Задача 'sass' выполняет сборку наших стилей.
gulp.task("sass", function() {
  return gulp.src("app/sass/main.scss")
  	.pipe(plumber({ // plumber - плагин для отловли ошибок.
			errorHandler: notify.onError(function(err) { // nofity - представление ошибок в удобном для вас виде.
				return {
					title: 'Styles',
					message: err.message
				}
			})
		}))
		.pipe(sourcemaps.init()) //История изменения стилей, которая помогает нам при отладке в devTools.
    .pipe(sass()) //Компиляция sass.
		.pipe(autoprefixer({ //Добавление autoprefixer.
			browsers: ['last 15 versions']
		}))
		// .pipe(cleanCSS())
    .pipe(gulp.dest("app/css"))
    .pipe(browserSync.reload({stream: true}))
});



gulp.task('libs', function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js'
		])
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('app/js'));
});


//Задача для удаление папки build.
gulp.task('clean', function() {
	return gulp.src('build/')
		.pipe(clean());
});



gulp.task('build', ['clean'], function() {

	var buildJs = gulp.src('app/js/**/*').pipe(gulp.dest('build/js'));
	var buildCss = gulp.src('app/css/**/*').pipe(gulp.dest('build/css'));
	var buildFonts = gulp.src('app/fonts/**/*').pipe(gulp.dest('build/fonts'));
	var buildImg = gulp.src('app/img/**/*').pipe(gulp.dest('build/img'));
	var buildHtml = gulp.src('app/*.html').pipe(gulp.dest('build/'));

});


// Create sprite
gulp.task('sprite', function () {
	var spriteData = gulp.src('app/img/icons/*.{png,jpg,jpeg}').pipe(spritesmith({
		imgName: 'sprite.png',
		cssName: 'sprite.css',
		cssVarMap: function (sprite) {
			var name = sprite.name.slice();
			if (name.lastIndexOf('_hover') !== -1) {
				name = name.slice(0, -6) + ':hover';
			} else if (name.lastIndexOf('_active') !== -1) {
				name = name.slice(0, -7) + '.active';
			}
			if (name.lastIndexOf('_after') !== -1) {
				sprite.name = name + ':after';
			} else {
				sprite.name = name + ':before';
			}
		}
	}));
	let imgStream = spriteData.img.pipe(gulp.dest('app/img')),
		cssStream = spriteData.css.pipe(gulp.dest('app/sass/'));
	return merge(imgStream, cssStream);
});




gulp.task('watch', ['sass', 'libs', 'browser-sync'], function() {
	gulp.watch('app/sass/**/*.scss', ['sass']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});





