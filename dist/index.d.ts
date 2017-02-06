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
