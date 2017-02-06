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
    }).then();
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
let _tasksMap = {};
function registerTasks(tasks) {
    Object.keys(tasks).forEach(key => {
        let task = tasks[key];
        if (!task.then) {
            task.then = () => new Error("Invalid task '" + key + "'");
            task.requirements = [];
        }
        else
            task.requirements = task.requirements || [];
        _tasksMap[key] = task;
    });
}
exports.registerTasks = registerTasks;
let _requireMap = {};
function lazyImport(...id) {
    return Promise.all(id.map(dsc => {
        if (!(dsc in _requireMap))
            try {
                return _requireMap[dsc] = Promise.resolve(require(dsc));
            }
            catch (err) {
                return _requireMap[dsc] = Promise.reject(err);
            }
        return _requireMap[dsc];
    }));
}
exports.lazyImport = lazyImport;
let _promiseMap = {};
function resolvePromise(task) {
    if (task in _promiseMap) {
        if (_promiseMap[task])
            return _promiseMap[task];
        else
            return _promiseMap[task] = Promise.reject(new Error("Circular dependencies detected while resolving task '" + task + "'"));
    }
    else {
        if (task in _tasksMap) {
            let desc = _tasksMap[task];
            _promiseMap[task] = null;
            let req = [];
            for (let i = 0; i < desc.requirements.length; i++)
                req.push(resolvePromise(desc.requirements[i]));
            return _promiseMap[task] = Promise.all(req)
                .then((res) => {
                console.log("Starting task '" + task + "'");
                return res;
            })
                .then(desc.then)
                .then((res) => {
                console.log("Finished task '" + task + "'");
                return res;
            });
        }
        else {
            return _promiseMap[task] = Promise.reject(new Error("No such task '" + task + "'"));
        }
    }
}
exports.resolvePromise = resolvePromise;
function parallel(...tasks) {
    let req = [];
    for (let i = 0; i < tasks.length; i++)
        req.push(resolvePromise(tasks[i]));
    return Promise.all(req);
}
exports.parallel = parallel;
function series(...tasks) {
    let ret = Promise.resolve();
    for (let i = 0; i < tasks.length; i++)
        ret = ret.then(() => resolvePromise(tasks[i]));
    return ret;
}
exports.series = series;
//# sourceMappingURL=index.js.map