# ShellS

**ShellS** is a specialized, high-performance terminal emulator built with modern web technologies. It is designed to provide a robust, multi-tabbed shell experience with advanced features like search, theming, and multi-process isolation.

![ShellS Screenshot](https://via.placeholder.com/800x450.png?text=ShellS+Terminal)

## Features

-   **Multi-Tab Support**: Run multiple isolated shell instances simultaneously.
-   **Process Isolation**: Each tab spawns a dedicated backend process, ensuring stability.
-   **Search Functionality**: Integrated search with wrapping and navigation support.
-   **Customizable Themes**: Toggle between themes (Dark/Light).
-   **Performance**: Built on `xterm.js` and `node-pty` for native-like performance.
-   **Cross-Platform**: Compatible with macOS, Windows, and Linux.

## Tech Stack

-   **Electron**: Framework for cross-platform desktop apps.
-   **React**: UI library for building the interface.
-   **TypeScript**: Strongly typed language for reliability.
-   **Vite**: Next-generation frontend tooling.
-   **node-pty**: Native interface to the pseudo-terminal.
-   **xterm.js**: Full-featured terminal component.

## Development

### Prerequisites

-   Node.js (v16 or higher)
-   npm

### Installation

```bash
npm install
```

### Running Locally

To start the development server with hot-reload:

```bash
npm run dev
```

### Building for Production

To create a production build for your platform:

**macOS**
```bash
npm run build:mac
```

**Windows**
```bash
npm run build:win
```

**Linux**
```bash
npm run build:linux
```

The output executables (DMG, AppImage, EXE) will be located in the `dist` or `release` directory.

## Troubleshooting

-   **Native Module Errors**: If you encounter errors related to `node-pty`, run:
    ```bash
    npm run rebuild
    ```

## License

MIT
