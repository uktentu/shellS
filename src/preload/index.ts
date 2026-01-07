import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  createTerminal: (id: string): void => ipcRenderer.send('terminal-create', id),
  closeTerminal: (id: string): void => ipcRenderer.send('terminal-close', id),
  write: (id: string, data: string): void => ipcRenderer.send('terminal-into', { id, data }),
  resize: (id: string, cols: number, rows: number): void =>
    ipcRenderer.send('terminal-resize', { id, cols, rows }),
  onIncomingData: (callback: (id: string, data: string) => void): (() => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      payload: { id: string; data: string }
    ): void => callback(payload.id, payload.data)
    ipcRenderer.on('terminal-incoming', listener)
    return () => {
      ipcRenderer.removeListener('terminal-incoming', listener)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
