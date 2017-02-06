"use strict";
const vfs = require("vinyl-fs");
const prepareWrite = require('vinyl-fs/lib/prepareWrite');
const writeContents = require('vinyl-fs/lib/dest/writeContents');
function loadFiles(globs, options) {
    return new Promise((resolve, reject) => {
        let files = [];
        vfs.src(globs, options)
            .on('data', (data) => {
            files.push(data);
        })
            .on('end', () => {
            resolve(files);
        });
    });
}
exports.loadFiles = loadFiles;
function writeFiles(outFolder, opt) {
    return function (files) {
        return Promise.all(files.map(file => new Promise((resolve, reject) => {
            prepareWrite(outFolder, file, opt, (err, writePath) => {
                if (err)
                    return reject(err);
                writeContents(writePath, file, (err) => {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
        })));
    };
}
exports.writeFiles = writeFiles;
//# sourceMappingURL=index.js.map