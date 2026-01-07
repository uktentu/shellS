import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onIncomingData: (callback: (data: string) => void) => void
      write: (data: string) => void
      resize: (cols: number, rows: number) => void
    }
  }
}
