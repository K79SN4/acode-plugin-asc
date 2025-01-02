const sidebarApps = acode.require("sidebarApps");

import plugin from "../plugin.json";
import app from "./app.js";
import utils from "./utils.js";

class AcodePluginASC {
    baseUrl = "";
    #asc = null;
    #stdout = null;
    #stderr = null;
    async init() {
        sidebarApps.add(
            app.icon,
            app.id,
            app.title,
            app.onInit,
            app.prepend,
            this.#loadASC.bind(this)
        );
        acode.define("asc-compile-project", this.#compileProject.bind(this));
    }
    async destroy() {
        acode.define("asc-compile-project", utils.noop);
        sidebarApps.remove(app.id);
        this.#asc = null;
        this.#stdout = null;
        this.#stderr = null;
    }
    async #loadASC() {
        if (this.#asc) {
            return;
        }
        this.#asc = await import(this.baseUrl + "lib/asc.js");
        this.#stdout = this.#asc.createMemoryStream();
        this.#stderr = this.#asc.createMemoryStream();
        app.printStdout("Version " + this.#asc.version);
    }
    async #compileProject() {
        if (!this.#asc) {
            return;
        }
        app.printStdout("");
        app.printStderr("");
        this.#stdout.reset();
        this.#stderr.reset();
        await this.#runMain();
        if (this.#stdout.length) {
            app.printStdout(this.#stdout.toString());
        }
        if (this.#stderr.length) {
            app.printStderr(this.#stderr.toString());
        }
    }
    async #runMain() {
        if (utils.getBaseDir() === "") {
            app.printStderr("Open a folder in Acode to enable compilation");
            return;
        }
        try {
            const argv = utils.parseArgv(app.scanStdin());
            if (argv[0] === "asc") {
                argv.shift();
            }
            // SEE https://github.com/AssemblyScript/Assemblyscript/tree/main/cli/index.js
            await this.#asc.main(argv, {
                stderr: this.#stderr,
                stdout: this.#stdout,
                listFiles: utils.listFiles,
                readFile: utils.readFile,
                writeFile: utils.writeFile,
            });
        } catch (e) {
            app.printStderr(e);
        }
        return;
    }
}

if (window.acode) {
    const acodePlugin = new AcodePluginASC();
    acode.setPluginInit(
        plugin.id,
        async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
            if (!baseUrl.endsWith("/")) {
                baseUrl += "/";
            }
            acodePlugin.baseUrl = baseUrl;
            await acodePlugin.init($page, cacheFile, cacheFileUrl);
        }
    );
    acode.setPluginUnmount(plugin.id, () => {
        acodePlugin.destroy();
    });
}
