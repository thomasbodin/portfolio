var gulp = require('gulp'),
    htmlmin = require('gulp-htmlmin'),
    sass = require('gulp-sass'),
    sassimport = require('gulp-sass-bulk-import'),
    scsslint = require('gulp-scsslint'),
    csso = require('gulp-csso'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    notify = require('gulp-notify'),
    iconfont = require('gulp-iconfont'),
    iconfontCss = require('gulp-iconfont-css'),
    plumber = require('gulp-plumber');


var runTimestamp = Math.round(Date.now()/1000);

var plumberErrorHandler = { errorHandler: notify.onError({
    title: 'Gulp',
    message: 'Error: <%= error.message %>'
})};

gulp.task('html', function() {
    return gulp.src('src/**/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist/'));
});

gulp.task('style', function () {
    return gulp.src(['src/style/**/*.scss'], {sourcemap: true})
        .pipe(scsslint('scsslint.yml'))
        .pipe(scsslint.reporter())
        .pipe(sassimport())
        .pipe(plumber(plumberErrorHandler))
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: [theme + 'style/src/']
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', '> 5%', 'ie 9'],
            cascade: false
        }))
        .pipe(csso())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/style/'));
});


gulp.task('script', function () {
    return gulp.src('src/script/**/*.js')
        .pipe(plumber(plumberErrorHandler))
        .pipe(jshint('.jshintrc', {fail: true}))
        .pipe(jshint.reporter(stylish))
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/script/'));
});


gulp.task('img', function () {
    return gulp.src('src/img/**/*')
        .pipe(plumber(plumberErrorHandler))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/img/'));
});


gulp.task('iconfont', function(){
    return gulp.src('src/assets/fonts/portfolio/svg/*.svg')
        .pipe(iconfontCss({
            fontName: 'portfolio',
            path: 'src/style/quark/_icons-template.scss',
            targetPath: 'src/style/quark/_icons.scss',
            fontPath: 'dist/assets/fonts/portfolio/'
        }))
        .pipe(iconfont({
            fontName: 'portfolio', // required
            prependUnicode: true, // recommended option
            formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'], // default, 'woff2' and 'svg' are available
            timestamp: runTimestamp // recommended to get consistent builds when watching files
        }))
        .on('glyphs', function(glyphs, options) {
            // CSS templating, e.g.
            console.log(glyphs, options);
        })
        .pipe(gulp.dest('dist/assets/fonts/portfolio/'));
});



gulp.task('default', ['html', 'style', 'script', 'img', 'iconfont']);


gulp.task('watch', function () {
    gulp.watch(
        'src/**/*.html', ['html']
    ).on('change', function(event){
        console.log('Le fichier ' + event.path + ' a ete modifie.');
    });

    gulp.watch(
        'src/style/**/*.scss', ['style']
    ).on('change', function(event){
        console.log('Le fichier ' + event.path + ' a ete modifie.');
    });

    gulp.watch(
        'src/script/**/*.js', ['script']
    ).on('change', function(event){
        console.log('Le fichier ' + event.path + ' a ete modifie.');
    }).on('error', notify.onError(function (error) {
        return error.message;
    }));

    gulp.watch(
        'src/img/**/*.{png,jpg,gif}', ['img']
    ).on('change', function(event){
        console.log('L\'image ' + event.path + ' a ete ajoute/modifie.');
    });

    gulp.watch(
        'src/assets/fonts/portfolio/svg/*.svg', ['iconfont']
    ).on('change', function(event){
        console.log('La nouvelle icone ' + event.path + ' a ete ajoute/modifie.');
    });
});
