/** @type {object} */
const url = acode.require("url");
/** @type {object} */
const fs = acode.require("fs");
/** @type {object} */
const encodings = acode.require("encodings");

import app from "./app.js";

export default {
    noop,
    parseArgv,
    getBaseDir,
    getActiveFile,
    listFiles,
    readFile,
    writeFile,
    createFile,
};

/** @returns {void} */
export function noop() {}

/**
 * @param {string} text=""
 * @returns {string[]}
 */
export function parseArgv(text = "") {
    /** @type {string[]} */
    const args = [];
    let currentArg = "";
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let escapeNext = false;
    
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (escapeNext) {
            currentArg += ch;
            escapeNext = false;
        } else if (ch === "\\") {
            escapeNext = true;
        } else if (ch === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
        } else if (ch === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
        } else if (ch === "\x20" && !inSingleQuote && !inDoubleQuote) {
            if (currentArg) {
                args.push(currentArg);
                currentArg = "";
            }
        } else {
            currentArg += ch;
        }
    } // for
    if (currentArg) {
        args.push(currentArg);
    }
    return args;
}

/** @returns {string} */
export function getBaseDir() {
    /** @type {object} */
    const safeRoot = window.addedFolder?.[0] ?? {};
    /** @type {string} */
    const path = safeRoot?.url ?? "";
    return path;
}

/** @returns {string} */
export function getActiveFile() {
    /** @returns {object} */
    const currentFile = window.editorManager?.activeFile ?? {};
    /** @returns {string} */
    const path = currentFile.uri ?? currentFile.name;
    return path ?? "untitled.txt";
}

/**
 * @param {string} dirName
 * @param {string} [baseDir]
 * @returns {Promise<null|string[]>}
 */
export async function listFiles(dirName, baseDir) {
    if (!baseDir || baseDir === ".") {
        baseDir = getBaseDir();
    }
    /** @type {string} */
    const path = url.join(baseDir, dirName);
    try {
        /** @type {object} */
        const pathFd = fs(path);
        if (!(await pathFd?.exists?.())) {
            /** @type {object[]} */
            const list = await pathFd?.lsDir?.();
            return list.map(entry => entry.url);
        }
    } catch (e) {
        app.printStderr(e);
    }
    return null;
}

/**
 * @param {string} filePath
 * @param {string} [baseDir]
 * @returns {Promise<string|null>}
 */
export async function readFile(filePath, baseDir) {
    if (!baseDir || baseDir === ".") {
        baseDir = getBaseDir();
    }
    /** @type {string} */
    const path = url.join(baseDir, filePath);
    try {
        /** @type {object} */
        const pathFd = fs(path);
        if (await fd?.exists?.()) {
            /** @type {Uint8Array} */
            const buf = await pathFd?.readFile?.();
            /** @type {string} */
            const text = await encodings.decode(buf, "UTF-8");
            return text ?? "";
        }
    } catch (e) {
        app.printStderr(e);
    }
    return null;
}

/**
 * @param {string} filePath
 * @param {Uint8Array|string} content 
 * @param {string} [baseDir] 
 * @returns {Promise<void>}
 */
export async function writeFile(filePath, content, baseDir) {
    /** @type {ArrayBuffer|syring} */
    let data = "";
    if (content instanceof Uint8Array) {
        data = content.buffer;
    } else if (typeof content === "string") {
        data = content;
    }
    if (!baseDir || baseDir === ".") {
        baseDir = getBaseDir();
    }
    /** @type {string} */
    const path = url.join(baseDir, filePath);
    try {
        /** @type {object} */
        const pathFd = fs(path);
        if (await pathFd?.exists?.()) {
            await pathFd?.writeFile?.(
                data //, "UTF-8"
            );
        } else {
            await createFile(
                filePath,
                content,
                baseDir
            );
        }
        return;
    } catch (e) {
        app.printStderr(e);
    }
    return;
}

/**
 * @param {string} filePath
 * @param {Uint8Array|string} content
 * @param {string} [baseDir] 
 * @returns {Promise<void>}
 */
export async function createFile(filePath, content, baseDir) {
    let data = "";
    if (content instanceof Uint8Array) {
        data = content.buffer;
    } else if (typeof content === "string") {
        data = content;
    }
    if (!baseDir || baseDir === ".") {
        baseDir = getBaseDir();
    }
    /** @type {string[]} */
    const dirs = filePath.split(/[/]+/).filter(Boolean);
    /** @type {string} */
    const fileName = dirs.pop();
    try {
        /** @type {string} */
        let cwd = baseDir;
        
        for (const dir of dirs) {
            /** @type {object} */
            const cwdFd = fs(cwd);
            /** @type {string} */
            const dirPath = url.join(cwd, dir);
            /** @type {object} */
            const dirFd = fs(dirPath);
            if (!(await dirFd?.exists?.())) {
                await cwdFd?.createDirectory?.(dir);
            }
            cwd = dirPath;
        } // for
        
        /** @type {object} */
        const cwdFd = fs(cwd);
        /** @type {string} */
        const path = url.join(cwd, fileName);
        /** @type {object} */
        const pathFd = fs(path);
        if (!(await pathFd?.exists?.())) {
            await cwdFd?.createFile?.(
                fileName, data
            );
        } else {
            await pathFd?.writeFile?.(
                data //, "UTF-8"
            );
        }
        return;
    } catch (e) {
        app.printStderr(e);
    }
    return;
}
