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
    })
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
