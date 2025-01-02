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

let $stdin = null;
let $stdout = null;
let $stderr = null;

function initApp($el) {
    $el.classList.add("acode-plugin-asc");
    $el.append(SidebarStyle());
    $el.append(SidebarHeader());
    $el.append(SidebarContent());
}

function SidebarStyle() {
    const cssText = `
.acode-plugin-asc {
    background-color: var(--bg-color);
    color: var(--text-color);
}

.acode-plugin-asc .header {
    padding: 5px;
    display: flex;
    flex-direction: column;
}

.acode-plugin-asc .title {
    font-size: 18px;
    font-weight: bold;
    text-align: center;
}

.acode-plugin-asc #compile-project-button {
    width: 100%;
    padding: 8px;
    border: 1px solid currentColor;
    border-radius: 4px;
    background: none;
    color: inherit;
    cursor: pointer;
}

.acode-plugin-asc #compile-project-button:hover {
    background-color: var(--active-icon-color);
}

.acode-plugin-asc .content {
  padding: 5px;
}

.acode-plugin-asc #stdin {
    width: 100%;
    margin: 0;
    padding: 8px;
    resize: horizontal;
}

.acode-plugin-asc #stdout:before {
    color: limegreen;
    content: "STDOUT";
}

.acode-plugin-asc #stderr:before {
    color: orangered;
    content: "STDERR";
}

#stdout,
#stderr {
    margin-top: 8px;
    max-height: 50vh;
    overflow: clip !important;
}
`;

    return tag("style", {
        id: "acode-plugin-asc-style",
        textContent: cssText,
    });
}

function SidebarHeader() {
    return tag("div", {
        className: "header",
        children: [Title(), ProjectButton()],
    });

    function Title() {
        return tag("div", {
            className: "title",
            textContent: "Acode Plugin ASC",
        });
    }

    function ProjectButton() {
        return tag("button", {
            id: "compile-project-button",
            textContent: "Run",
            onclick: function() {
                const command = acode.require("asc-compile-project");
                if (typeof command === "function") {
                    command();
                }
            },
        });
    }
}

function SidebarContent() {
    return tag("div", {
        className: "content",
        children: [
            Stdin(),
            Stdout(),
            Stderr()
        ],
    });

    function Stdin() {
        return ($stdin = tag("textarea", {
            id: "stdin",
            placeholder: "ARGV",
        }));
    }

    function Stdout() {
        return ($stdout = tag("div", {
            id: "stdout",
        }));
    }

    function Stderr() {
        return ($stderr = tag("div", {
            id: "stderr",
        }));
    }
}

function scanStdin() {
    if ($stdin) {
        return $stdin.value;
    }
    return "";
}

function printStdout(text = "") {
    if ($stdout) {
        $stdout.innerText = "\n" + text;
    }
}

function printStderr(text = "") {
    if ($stderr) {
        $stderr.innerText = "\n" + text;
    }
}