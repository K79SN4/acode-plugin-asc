const url = acode.require("url");
const fs = acode.require("fs");
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
};

export function noop() {}

export function parseArgv(text) {
    if (!text) {
        text = "";
    }

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

export function getBaseDir() {
    const safeRoot = window.addedFolder?.[0] ?? {};
    const path = safeRoot?.url ?? "";
    return path;
}

export function getActiveFile() {
    const currentFile = window.editorManager?.activeFile ?? {};
    const path = currentFile.uri ?? currentFile.name;
    return path ?? "untitled.txt";
}

export async function listFiles(dirName, baseDir) {
    if (!baseDir || baseDir === ".") {
        baseDir = getBaseDir();
    }
    const path = url.join(baseDir, fileName);
    try {
        const fd = fs(path);
        if (!(await fd?.exists?.())) {
            return await fd.lsDir();
        }
    } catch (e) {
        app.printStderr(e);
    }
    return null;
}

export async function readFile(fileName, baseDir) {
    if (!baseDir || baseDir === ".") {
        baseDir = getBaseDir();
    }
    const path = url.join(baseDir, fileName);
    try {
        const fd = fs(path);
        if (await fd?.exists?.()) {
            const buf = await fd.readFile();
            const text = await encodings.decode(buf, "UTF-8");
            return text ?? "";
        }
    } catch (e) {
        app.printStderr(e);
    }
    return null;
}

export async function writeFile(fileName, content, baseDir) {
    if (content instanceof Uint8Array) {
        content = content.buffer;
    }
    if (!baseDir || baseDir === ".") {
        baseDir = getBaseDir();
    }
    const path = url.join(baseDir, fileName);
    try {
        const fd = fs(path);
        if (await fd?.exists?.()) {
            fd.writeFile(content);
            return;
        }
        // FIXME create file recursively starting from base directory
        app.printStdout("Please create new file '" + fileName + "' to avoid permission issues");
        return;
    } catch (e) {
        app.printStderr(e);
    }
    return;
}