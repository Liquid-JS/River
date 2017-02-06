/// <reference types="vinyl" />
import * as vfs from 'vinyl-fs';
import * as File from 'vinyl';
export declare function loadFiles(globs: string | Array<string>, options?: vfs.ISrcOptions): Promise<File[]>;
export declare function writeFiles(outFolder: string, opt?: {
    cwd?: string;
    mode?: number | string;
    dirMode?: number | string;
    overwrite?: boolean;
}): (files: File[]) => Promise<{}[]>;
export interface TaskDescriptor {
    requirements?: Array<string>;
    then: (arg?: any | Array<any>) => PromiseLike<any> | any;
}
export declare function registerTasks(tasks: {
    [key: string]: TaskDescriptor;
}): void;
export declare function lazyImport(...id: Array<string>): Promise<any[]>;
export declare function resolvePromise(task: string): Promise<any>;
export declare function parallel(...tasks: Array<string>): Promise<any[]>;
export declare function series(...tasks: Array<string>): Promise<any>;
