#!/usr/bin/env node

var fs = require('fs');
var browserify = require('browserify');
var watchify = require('watchify');
var browserSync = require('browser-sync');
var b = browserify(watchify.args);
var through = require('through');

function replaceGlslifyPex(file) {
    var data = '';
    return through(write, end);

    function write (buf) { data += buf }
    function end () {
        this.queue(data.replace(/glslify-pex/g, 'glslify'));
        this.queue(null);
    }
}

function watch() {
    b.add('./pbr.js');

    b.transform(replaceGlslifyPex);
    b.transform({global:true}, 'glslify-promise/transform');

    b.ignore('plask');

    var bundler = watchify(b);
    bundler.on('update', rebundle);

    function rebundle () {
        return bundler.bundle()
        // log errors if they happen
        .on('error', function(e) {
            console.log('Browserify Error', e);
        })
        .pipe(fs.createWriteStream('pbr.web.js'))
        browserSync.reload();
    }

    return rebundle()

}

watch();


var files = [
    './pbr.web.js'
];

browserSync.init(files, {
    server: {
        baseDir: './'
    }
});
