import * as esbuild from "esbuild";
import path from "node:path";
import url from "node:url";

try {
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const distLib = path.resolve(__dirname, "../dist/lib/");

    console.log("Building assets ✨");

    await esbuild.build({
        logLevel: "info",
        color: true,
        platform: "browser",
        target: ["es2024"],
        format: "esm",
        outdir: distLib,
        entryPoints: {
            "asc": "assemblyscript/asc"
        },
        splitting: false,
        treeShaking: true,
        minify: true,
        bundle: true,
        external: [
            "path",
            "url",
            "module",
            "fs",
        ],
    });

    console.log("Asset build complete 🌟");
} catch (e) {
    console.error("Asset build failed 👀", e);
}