import * as esbuild from "esbuild";
import { exec } from "node:child_process";

function packZip(callback) {
    exec("node scripts/pack-zip.cjs", (err, stdout, stderr) => {
        if (err) {
            console.error("Error packing zip:", err);
            return;
        }
        if (typeof callback === "function") callback();
        console.log(stdout.trim());
    });
}

const zipPlugin = {
    name: "zip-plugin",
    setup(build) {
        build.onEnd(packZip);
    },
};

const isServe = process.argv.includes("--serve");

const buildConfig = {
    logLevel: "info",
    color: true,
    platform: "browser",
    target: ["es2024"],
    format: "iife",
    outdir: "dist",
    entryPoints: [
        "src/main.js",
    ],
    splitting: false,
    treeShaking: true,
    minify: isServe,
    bundle: true,
    plugins: [zipPlugin],
};

const serveConfig = {
    servedir: ".",
    port: 3000,
    host: "localhost",
};

(async function() {
    if (isServe) {
        console.log("Starting development server ✨");
        const ctx = await esbuild.context(buildConfig);
        await ctx.watch();
        await ctx.serve(serveConfig);
    } else {
        console.log("Building for production ✨");
        await esbuild.build(buildConfig);
        console.log("Production build complete 🎉");
    }
})();
