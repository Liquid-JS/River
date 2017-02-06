import * as path from 'path'
import { registerTasks, parallel, lazyImport } from '../index'

lazyImport(path.join(process.cwd(), 'river.conf.js'))
    .then(tasksDecl => {
        registerTasks(tasksDecl[0])

        let tasks = process.argv.filter((task, i) => i > 1 && !task.startsWith('-'))
        return parallel(...tasks)
    })
    .then(() => console.log('done'))
    .catch(err => console.error("River error: " + err))
