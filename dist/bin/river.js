"use strict";
const path = require("path");
const index_1 = require("../index");
index_1.lazyImport(path.join(process.cwd(), 'river.conf.js'))
    .then(tasksDecl => {
    index_1.registerTasks(tasksDecl[0]);
    let tasks = process.argv.filter((task, i) => i > 1 && !task.startsWith('-'));
    return index_1.parallel(...tasks);
})
    .then(() => console.log('done'))
    .catch(err => console.error("River error: " + err));
//# sourceMappingURL=river.js.map