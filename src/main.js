/** @type {object} */
const globalSettings = acode.require("settings");
/** @type {object} */
const sidebarApps = acode.require("sidebarApps");

import plugin from "../plugin.json";
import app from "./app.js";
import utils from "./utils.js";

class AcodePluginASC {
    /** @type {string} */
    baseUrl = "";
    /** @type {object|null} */
    #pluginSettings = null;
    /** @type {boolean} */
    #sidebarMounted = false;
    /** @type {object|null} asc */
    #asc = null;
    /** @type {object|null} asc.MemoryStream */
    #stdout = null;
    /** @type {object|null} asc .MemoryStream */
    #stderr = null;

    constructor() {
        this.#pluginSettings = globalSettings.value[plugin.id] || null;
        if (!this.#pluginSettings) {
            globalSettings.value[plugin.id] = this.#pluginSettings = {
                sidebar: true,
            };
            globalSettings.update(false);
        }

        this.onSettingChange = this.onSettingChange.bind(this);
        this.loadASC = this.loadASC.bind(this);
        this.compileProject = this.compileProject.bind(this);
    }

    /** @returns {Promise<void>} */
    async init() {
        acode.define("asc-compile-project", this.compileProject);
        this.renderSidebar(!!this.#pluginSettings.sidebar);
    }

    /** @returns {Promise<void>} */
    async destroy() {
        // FIXME noop doesn't throw or warn
        acode.define("asc-compile-project", utils.noop);
        this.renderSidebar(false);

        this.#asc = this.#stdout = this.#stderr = this.#pluginSettings = null;

        delete globalSettings.value[plugin.id];
        globalSettings.update(false);
    }

    /**
     * @param {boolean} mount=false
     * @returns {void}
     */
    renderSidebar(mount = false) {
        if (mount) {
            if (this.#sidebarMounted) return;
            sidebarApps.add(
                app.icon,
                app.id,
                app.title,
                app.onInit,
                app.prepend,
                this.loadASC,
            );
            this.#sidebarMounted = true;
        } else {
            if (!this.#sidebarMounted) return;
            sidebarApps.remove(plugin.id);
            this.#sidebarMounted = false;
        }
    }

    /** @returns {object[]} */
    get settingList() {
        return [
            {
                key: "sidebar",
                text: "ASC Sidebar",
                info: "Enable/disable sidebar app for ASC",
                checkbox: !!this.#pluginSettings.sidebar,
         },
      ];
    }

    /**
     * @param {string} key
     * @param {any} value
     * @returns {void}
     */
    onSettingChange(key, value) {
        globalSettings.value[plugin.id][key] = this.#pluginSettings[key] = value;
        globalSettings.update(false);

        this.renderSidebar(!!this.#pluginSettings.sidebar);
    }

    /** @returns {Promise<void>} */
    async loadASC() {
        if (this.#asc) return;

        this.#asc = await import(`${this.baseUrl}lib/asc.js`);
        this.#stdout = this.#asc.createMemoryStream();
        this.#stderr = this.#asc.createMemoryStream();
        // app.printStdout("Version " + this.#asc.version);
    }

    /** @returns {Promise<void>} */
    async compileProject() {
        await this.loadASC();

        this.#stdout.reset();
        this.#stderr.reset();

        await this.#runMain();
        app.printStdout(this.#stdout.toString());
        app.printStderr(this.#stderr.toString());
    }

    /** @returns {Promise<void>} */
    async #runMain() {
        if (utils.getBaseDir() === "") {
            app.printStderr("Open a folder to enable compilation.");
            return;
        }

        try {
            /** @type {string[]} */
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
    }
}

if (window.acode) {
    const pluginInstance = new AcodePluginASC();

    acode.setPluginInit(
        plugin.id,
        async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
            if (!baseUrl.endsWith("/")) {
                baseUrl += "/";
            }
            pluginInstance.baseUrl = baseUrl;

            await pluginInstance.init($page, cacheFile, cacheFileUrl);
        },
        {
            list: pluginInstance.settingList,
            cb: pluginInstance.onSettingChange,
        },
    );

    acode.setPluginUnmount(plugin.id, async () => {
        await pluginInstance.destroy();
    });
}