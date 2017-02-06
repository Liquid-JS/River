import * as vfs from 'vinyl-fs'
import * as File from 'vinyl'
const prepareWrite = require('vinyl-fs/lib/prepareWrite')
const writeContents = require('vinyl-fs/lib/dest/writeContents')

export function loadFiles(globs: string | Array<string>, options?: vfs.ISrcOptions) {
    return new Promise<Array<File>>((resolve, reject) => {
        let files: Array<File> = []
        vfs.src(globs, options)
            .on('data', (data: File) => {
                files.push(data)
            })
            .on('end', () => {
                resolve(files)
            })
    }).then()
}

export function writeFiles(outFolder: string, opt?: {
    cwd?: string
    mode?: number | string
    dirMode?: number | string
    overwrite?: boolean
}) {
    return function (files: Array<File>) {
        return Promise.all(files.map(file => new Promise((resolve, reject) => {
            prepareWrite(outFolder, file, opt, (err, writePath) => {
                if (err)
                    return reject(err)

                writeContents(writePath, file, (err) => {
                    if (err)
                        return reject(err)

                    resolve()
                })
            })
        })))
    }
}

export interface TaskDescriptor {
    requirements?: Array<string>,
    then: (arg?: any | Array<any>) => PromiseLike<any> | any
}

let _tasksMap: { [key: string]: TaskDescriptor } = {}

export function registerTasks(tasks: { [key: string]: TaskDescriptor }) {
    Object.keys(tasks).forEach(key => {
        let task = tasks[key]
        if (!task.then) {
            task.then = () => new Error("Invalid task '" + key + "'")
            task.requirements = []
        } else
            task.requirements = task.requirements || []
        _tasksMap[key] = task
    })
}

let _requireMap: { [key: string]: Promise<any> } = {}

export function lazyImport(...id: Array<string>) {
    return Promise.all(id.map(dsc => {
        if (!(dsc in _requireMap))
            try {
                return _requireMap[dsc] = Promise.resolve(require(dsc))
            } catch (err) {
                return _requireMap[dsc] = Promise.reject(err)
            }
        return _requireMap[dsc]
    }))
}

let _promiseMap: { [key: string]: Promise<any> } = {}

export function resolvePromise(task: string) {
    if (task in _promiseMap) {
        if (_promiseMap[task])
            return _promiseMap[task]
        else
            return _promiseMap[task] = Promise.reject(new Error("Circular dependencies detected while resolving task '" + task + "'"))
    } else {
        if (task in _tasksMap) {
            let desc = _tasksMap[task]
            _promiseMap[task] = null
            let req: Array<Promise<any>> = []

            for (let i = 0; i < desc.requirements.length; i++)
                req.push(resolvePromise(desc.requirements[i]))

            return _promiseMap[task] = Promise.all(req)
                .then((res) => {
                    console.log("Starting task '" + task + "'")
                    return res
                })
                .then(desc.then)
                .then((res) => {
                    console.log("Finished task '" + task + "'")
                    return res
                })
        } else {
            return _promiseMap[task] = Promise.reject(new Error("No such task '" + task + "'"))
        }
    }
}

export function parallel(...tasks: Array<string>) {
    let req: Array<Promise<any>> = []
    for (let i = 0; i < tasks.length; i++)
        req.push(resolvePromise(tasks[i]))
    return Promise.all(req)
}

export function series(...tasks: Array<string>) {
    let ret: Promise<any> = Promise.resolve()
    for (let i = 0; i < tasks.length; i++)
        ret = ret.then(() => resolvePromise(tasks[i]))
    return ret
}