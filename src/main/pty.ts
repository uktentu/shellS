import * as pty from 'node-pty'
import { BrowserWindow, ipcMain } from 'electron'
import os from 'os'

export class PtyManager {
  private mainWindow: BrowserWindow | null = null
  private ptyProcesses: Map<string, pty.IPty> = new Map()

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.setupIpc()
  }

  // Old init removed, logic moved to create
  create(id: string): void {
    const platform = os.platform()
    let shell = process.env.SHELL

    if (platform === 'win32') {
      shell = shell || 'powershell.exe'
    } else {
      shell = shell || '/bin/bash'
    }

    const cwd = process.env.HOME || process.cwd()

    console.log(`[PtyManager] Spawning shell ${id}: ${shell}, cwd: ${cwd}`)

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ptyProcess = (pty as any).spawn(shell, [], {
        name: 'xterm-256color',
        cols: 80,
        rows: 30,
        cwd: cwd,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        env: process.env as any
      })

      // Verify process creation
      // Verify process creation
      if (ptyProcess) {
        // console.log(`[PtyManager] Shell ${id} started via ${shell}`);
      }

      ptyProcess.onData((data) => {
        // console.log(`[PtyManager] Data from ${id}: ${data.length} bytes`); // Debug log
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send('terminal-incoming', { id, data })
        }
      })

      this.ptyProcesses.set(id, ptyProcess)
    } catch (e) {
      console.error('[PtyManager] Failed to spawn pty:', e)
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('terminal-incoming', {
          id,
          data: `\r\n\x1b[31mError launching shell: ${(e as Error).message}\x1b[0m\r\n`
        })
      }
    }
  }

  setupIpc(): void {
    ipcMain.on('terminal-create', (_event, id) => {
      this.create(id)
    })

    ipcMain.on('terminal-close', (_event, id) => {
      const ptyProc = this.ptyProcesses.get(id)
      if (ptyProc) {
        ptyProc.kill()
        this.ptyProcesses.delete(id)
      }
    })

    ipcMain.on('terminal-into', (_event, payload) => {
      const { id, data } = payload
      const ptyProc = this.ptyProcesses.get(id)
      if (ptyProc) {
        ptyProc.write(data)
      }
    })

    ipcMain.on('terminal-resize', (_event, payload) => {
      const { id, cols, rows } = payload
      const ptyProc = this.ptyProcesses.get(id)
      if (ptyProc) {
        ptyProc.resize(cols, rows)
      }
    })
  }
}
