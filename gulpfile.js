const gulp = require('gulp');
const HubRegistry = require('gulp-hub');
const browserSync = require('browser-sync');
const conf = require('./conf/gulp.conf');
const useref = require('gulp-useref');
const awspublish = require('gulp-awspublish');
const parallelize = require('concurrent-transform');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const jsonminify = require('gulp-jsonminify');
const aws = require('./aws.json');
const gutil = require('gulp-util');

// Load some files into the registry
const hub = new HubRegistry([conf.path.tasks('*.js')]);

// Tell gulp to use the tasks just loaded
gulp.registry(hub);

gutil.env.URL_BUCKET = aws.env.dev;

gulp.task('inject', gulp.series('inject', gulp.parallel('styles', 'scripts')));
gulp.task('build', gulp.series(production, 'partials', gulp.parallel('inject', 'other', 'icons'), 'build'));
gulp.task('test', gulp.series('scripts', 'karma:single-run'));
gulp.task('test:auto', gulp.series('watch', 'karma:auto-run'));
gulp.task('serve', gulp.series('inject', 'watch', 'browsersync', 'icons', mv, join));
gulp.task('serve:dist', gulp.series('default', 'browsersync:dist'));
gulp.task('default', gulp.series('clean', 'build'));
gulp.task('watch', watch);
gulp.task('upload', upload);
gulp.task('deploy', gulp.series('clean', 'build', resources, optimize, upload));

gulp.task('icons', function(done) {
  return gulp.src([
      './bower_components/components-font-awesome/fonts/**.*',
      './bower_components/simple-line-icons/fonts/**.*'
    ])
    .pipe(gulp.dest('./.tmp/fonts'))
    .pipe(gulp.dest('./dist/fonts'));
  done();
});

function reloadBrowserSync(cb) {
  browserSync.reload();
  cb();
}

function production(done) {
  gutil.env.URL_BUCKET = aws.env.prod;
  done();
}

function watch(done) {
  gulp.watch([
    conf.path.src('index.html'),
    'bower.json'
  ], gulp.parallel('inject'));

  gulp.watch(conf.path.src('app/**/*.html'), reloadBrowserSync);
  gulp.watch([
    conf.path.src('**/*.scss'),
    conf.path.src('**/*.css'),
    '../**/*.php'
  ], gulp.series('styles', mv, join));
  gulp.watch(conf.path.src('**/*.js'), gulp.series('inject', mv, join));
  done();
}

function join(done) {
  return gulp.src(conf.path.tmp('index.phtml'))
    .pipe(useref())
    .pipe(gulp.dest(conf.path.tmp()))
    .pipe(browserSync.stream());
  done();
}

function mv(done) {
  return gulp.src('./.tmp/index.html')
    .pipe(rename('index.phtml'))
    .pipe(gulp.dest('./.tmp'));
  done();
}

function upload(done) {
  var headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
  };

  var publisher = awspublish.create({
    region: aws.region,
    params: {
      Bucket: aws.bucket
    },
    accessKeyId: aws.key,
    secretAccessKey: aws.secret
  });

 return gulp.src(conf.path.dist('{scripts,styles,fonts,projects}/**'))
    .pipe(awspublish.gzip())
    .pipe(parallelize(publisher.publish(headers), 20))
    .pipe(publisher.sync('projects/' + aws.project))
    .pipe(awspublish.reporter());
  done();
}

function resources(done) {
  return gulp.src('src/app/resources/**/**')
    .pipe(gulp.dest(conf.path.dist('projects/' + aws.project)));
  done();
};

function optimize(done) {
    gulp.src('src/app/resources/json/**/*')
      .pipe(jsonminify())
      .pipe(gulp.dest(conf.path.dist('projects/' + aws.project + '/json')));
    return gulp.src(['src/app/resources/images/**/**'])
      .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng({optimizationLevel: 7}),
        imagemin.svgo({plugins: [{removeViewBox: true}]})
      ]))
      .pipe(gulp.dest(conf.path.dist('projects/' + aws.project + '/images')));
    done();
};
