import { ITheme } from 'xterm'

export interface ThemeDefinition {
  name: string
  theme: ITheme
}

export const themes: Record<string, ThemeDefinition> = {
  obsidian: {
    name: 'Obsidian',
    theme: {
      background: '#1e1e2e', // Catppuccin Mocha Base
      foreground: '#cdd6f4',
      cursor: '#f5e0dc',
      selectionBackground: '#585b70',
      black: '#45475a',
      red: '#f38ba8',
      green: '#a6e3a1',
      yellow: '#f9e2af',
      blue: '#89b4fa',
      magenta: '#f5c2e7',
      cyan: '#94e2d5',
      white: '#bac2de',
      brightBlack: '#585b70',
      brightRed: '#f38ba8',
      brightGreen: '#a6e3a1',
      brightYellow: '#f9e2af',
      brightBlue: '#89b4fa',
      brightMagenta: '#f5c2e7',
      brightCyan: '#94e2d5',
      brightWhite: '#a6adc8'
    }
  },
  dracula: {
    name: 'Dracula',
    theme: {
      background: '#282a36',
      foreground: '#f8f8f2',
      cursor: '#f8f8f2',
      selectionBackground: '#44475a',
      black: '#21222c',
      red: '#ff5555',
      green: '#50fa7b',
      yellow: '#f1fa8c',
      blue: '#bd93f9',
      magenta: '#ff79c6',
      cyan: '#8be9fd',
      white: '#f8f8f2',
      brightBlack: '#6272a4',
      brightRed: '#ff6e6e',
      brightGreen: '#69ff94',
      brightYellow: '#ffffa5',
      brightBlue: '#d6acff',
      brightMagenta: '#ff92df',
      brightCyan: '#a4ffff',
      brightWhite: '#ffffff'
    }
  },
  gitbash: {
    name: 'Git Bash',
    theme: {
      background: '#000000',
      foreground: '#bfbfbf',
      cursor: '#bfbfbf',
      selectionBackground: '#002f6c',
      black: '#000000',
      red: '#bf0000',
      green: '#00bf00',
      yellow: '#bfbf00',
      blue: '#0000bf',
      magenta: '#bf00bf',
      cyan: '#00bfbf',
      white: '#bfbfbf',
      brightBlack: '#666666',
      brightRed: '#ff0000',
      brightGreen: '#00ff00',
      brightYellow: '#ffff00',
      brightBlue: '#0000ff',
      brightMagenta: '#ff00ff',
      brightCyan: '#00ffff',
      brightWhite: '#ffffff'
    }
  },
  hacker: {
    name: 'Hacker',
    theme: {
      background: '#0d0208',
      foreground: '#00ff41',
      cursor: '#008F11',
      selectionBackground: '#003B00',
      black: '#000000',
      red: '#ff0000',
      green: '#00ff41',
      yellow: '#00fc00',
      blue: '#003b00',
      magenta: '#008f11',
      cyan: '#00ff00',
      white: '#00ff41',
      brightBlack: '#003b00',
      brightRed: '#00ff00',
      brightGreen: '#00ff41',
      brightYellow: '#00fc00',
      brightBlue: '#003b00',
      brightMagenta: '#008f11',
      brightCyan: '#00ff00',
      brightWhite: '#00ff41'
    }
  }
}
