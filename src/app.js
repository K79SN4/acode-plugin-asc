import plugin from "../plugin.json";

export default {
    icon: "settings",
    id: plugin.id,
    title: plugin.name,
    onInit: initApp,
    prepend: false,
    onSelected: null,
    scanStdin,
    printStderr,
    printStdout,
};

/** @type {HTMLElement} */
let $stdin = null;
/** @type {HTMLElement} */
let $stdout = null;
/** @type {HTMLElement} */
let $stderr = null;

/**
 * @param {HTMLElement} $el
 * @returns {void}
 */
function initApp($el) {
    $el.classList.add("acode-plugin-asc");
    $el.append(SidebarStyle());
    $el.append(SidebarHeader());
    $el.append(SidebarInput());
    $el.append(SidebarOutput());
}

/** @returns {HTMLElement} */
function SidebarStyle() {
    const cssText = `
 .acode-plugin-asc { padding: 8px; }
 .acode-plugin-asc .header { text-align: center; font-size: 1.2rem; font-weight: bold; }
 .acode-plugin-asc label { font-size: 14px; font-weight: bold; }
 .acode-plugin-asc #compile-project-button { margin: 10px 0; width: 100%; padding: 0.5rem; font-size: 1rem; background: dodgerblue; color: white; border: none; border-radius: 5px; cursor: pointer; transition: transform 0.3s ease, background-color 0.3s ease; }
 .acode-plugin-asc #compile-project-button:hover:active { background-color: #0066cc; transform: scale(0.95); }
 .acode-plugin-asc #stdin { width: 100%; min-height: 2rem; padding: 0.5rem; }
 .acode-plugin-asc #stdin::placeholder { opacity: 0.5; }
 .acode-plugin-asc ul { overflow-y: auto; overflow-x: hidden; }
 .acode-plugin-asc #stdout, .acode-plugin-asc #stderr { max-height: fit-content; width: 100%; min-height: 1rem; animation-duration: 2s; }
 .acode-plugin-asc .red-text { color: orangered; } 
 .acode-plugin-asc .green-text { color: mediumseagreen; } 
 .acode-plugin-asc .blue-text { color: dodgerblue; }`;

    return tag("style", {
        textContent: cssText,
    });
}

/** @returns {HTMLElement} */
function SidebarHeader() {
    return tag("div", {
        className: "header",
        children: [Title()],
    });

    /** @returns {HTMLElement} */
    function Title() {
        return tag("span", {
            className: "title",
            textContent: "Acode Plugin ASC",
        });
    }
}

/** @returns {HTMLElement} */
function SidebarInput() {
    return tag("div", {
        children: [
            ProjectButton(),
            tag("label", { className: "blue-text", for: "stdin", textContent: "ARGV" }),
            Stdin(),
        ],
    });

    /** @returns {HTMLElement} */
    function ProjectButton() {
        return tag("button", {
            id: "compile-project-button",
            textContent: "Compile",
            onclick: function() {
                /** @type {()=>void} */
                const action = acode.require("asc-compile-project");
                action?.();
            },
        });
    }

    /** @returns {HTMLElement} */
    function Stdin() {
        return ($stdin = tag("textarea", {
            id: "stdin",
            placeholder: "Compiler options...",
        }));
    }
}

/** @returns {HTMLElement} */
function SidebarOutput() {
    return tag("ul", {
        className: "scroll",
        children: [
            tag("label", {
                className: "green-text",
                textContent: "STDOUT",
                for: "stderr",
            }),
            Stdout(),
            tag("label", {
                className: "red-text",
                textContent: "STDERR",
                for: "stderr",
            }),
            Stderr(),
        ],
    });

    /** @returns {HTMLElement} */
    function Stdout() {
        return ($stdout = tag("div", {
            id: "stdout",
        }));
    }

    /** @returns {HTMLElement} */
    function Stderr() {
        return ($stderr = tag("div", {
            id: "stderr",
        }));
    }
}

/** @returns {string} */
function scanStdin() {
    if (!!$stdin) {
        return $stdin.value;
    }
    return "";
}

/**
 * @param {string} text=""
 * @returns {void}
 */
function printStdout(text = "") {
    if (!!$stdout) {
        // SEE https://developer.mozilla.org/docs/Web/API/Element/animate
        $stdout.animate([{ opacity: "0" }, { opacity: "1" }], 1000);
        $stderr.animate([{ opacity: "0" }, { opacity: "1" }], 1000);
        $stdout.innerText = text;
    }
}

/**
 * @param {string} text=""
 * @returns {void}
 */
function printStderr(text = "") {
    if (!!$stderr) {
        $stdout.animate([{ opacity: "0" }, { opacity: "1" }], 1000);
        $stderr.animate([{ opacity: "0" }, { opacity: "1" }], 1000);
        $stderr.innerText = text;
    }
}