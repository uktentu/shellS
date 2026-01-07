/// <reference types="vite/client" />

interface Window {
  electron: ElectronAPI
  api: {
    createTerminal: (id: string) => void
    closeTerminal: (id: string) => void
    write: (id: string, data: string) => void
    resize: (id: string, cols: number, rows: number) => void
    onIncomingData: (callback: (id: string, data: string) => void) => () => void
  }
}
