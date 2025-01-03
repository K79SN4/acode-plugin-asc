# Acode Plugin ASC

Acode plugin for using the [AssemblyScript](https://www.assemblyscript.org/) compiler. Configure and compile AssemblyScript projects directly within the Acode editor.

---

## Building from Source

1. **Clone the Repository**:

    ```bash
    git clone https://github.com/k79sn4/acode-plugin-asc.git
    cd acode-plugin-asc
    ```

2. **Install Dependencies**:

    ```bash
    npm install
    ```

3. **Build Assets**:

    ```bash
    npm run assets
    ```

4. **Build Plugin**:

    **Development version**

    ```bash
    npm run dev
    ```

    **Production version**

    ```bash
    npm run build
    ```

5. **Install the Plugin**:  
   Use the generated `dist.zip` file to install the plugin.

---

## Features

-   Compile AssemblyScript projects directly within Acode.
-   Pass [arguments](https://www.assemblyscript.org/compiler.html#compiler-options) to the compiler.
-   View compilation output and errors.
-   Read and write support for existing files using Acode's [file system API](https://acode.app/plugin-docs/fs-operation?title=Fs%20Operation).
-   **Limitation**: Creating new files is not supported in the current version.

---

## Usage

1. **Open the Plugin**:  
   Tap the plugin icon in Acode's sidebar to access the interface.
2. **Pass Arguments**:  
   Use the textarea (marked as `ARGV`) to provide custom arguments for the compiler.
3. **Compile Project**:  
   Click the `Run` button to compile the current project (the top-most folder opened in Acode).
   
   Output messages are displayed in the `STDOUT` section, and errors in the `STDERR` section.

4. **Programmatic Use**:  
   Execute the compiler by calling the registered command:
    ```javascript
    const action = acode.require("asc-compile-project");
    action();
    ```

---

## Testing the Plugin

1. Open an AssemblyScript project in Acode.
2. Launch the plugin from the sidebar.
3. Provide arguments in the `ARGV` field.
4. Click the `Run` button and verify the output in `STDOUT` and `STDERR` fields.

---

## Contributing

Contributions to improve this plugin are welcome! Use github [issues](https://github.com/K79SN4/acode-plugin-asc/issues) for bugs and feature requests.

---

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](https://github.com/k79sn4/acode-plugin-asc/tree/main/LICENSE) file for details.
