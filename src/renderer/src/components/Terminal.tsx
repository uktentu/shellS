import React, { useEffect, useRef } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { SearchAddon } from 'xterm-addon-search'
import 'xterm/css/xterm.css'
import { formatLogLine } from '../utils/logFormatter'

import { ITheme } from 'xterm'

interface TerminalProps {
    id: string // New ID prop
    theme?: ITheme
    isActive?: boolean
}

export const Terminal: React.FC<TerminalProps> = ({ id, theme, isActive }) => {
    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<XTerm | null>(null)
    // Timer ref for debounce
    const flushTimerRef = useRef<NodeJS.Timeout | null>(null)
    const [logMode, setLogMode] = React.useState(false)
    const logModeRef = useRef(false)
    const bufferRef = useRef('')

    // Context Menu State
    const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number } | null>(null)

    // Search state
    const [showSearch, setShowSearch] = React.useState(false)
    const [searchText, setSearchText] = React.useState('')
    const searchAddonRef = useRef<SearchAddon | null>(null)
    const fitAddonRef = useRef<FitAddon | null>(null) // Added missing ref

    // Update ref when state changes
    useEffect(() => {
        logModeRef.current = logMode
        // When disabling log mode, flush the buffer if any
        if (!logMode) {
            if (bufferRef.current && xtermRef.current) {
                xtermRef.current.write(bufferRef.current)
                bufferRef.current = ''
            }
        }
    }, [logMode])

    // Initialize Terminal
    useEffect(() => {
        if (!terminalRef.current) return

        // Create shell in backend
        window.api.createTerminal(id)

        const term = new XTerm({
            cursorBlink: true,
            fontSize: 15,
            lineHeight: 1.3,
            fontFamily: '"JetBrains Mono", Menlo, Monaco, "Courier New", monospace',
            theme: theme || {
                background: '#1e1e2e',
                foreground: '#cdd6f4'
            },
            allowProposedApi: true
        })

        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        fitAddonRef.current = fitAddon // Assign to ref

        const searchAddon = new SearchAddon()
        term.loadAddon(searchAddon)
        searchAddonRef.current = searchAddon

        const handleKeyDown = (e: KeyboardEvent): void => {
            // Support Alt+F3 as requested
            if (e.altKey && e.key === 'F3') {
                e.preventDefault()
                setShowSearch((prev) => !prev)
                return
            }

            // Keep Cmd+F for Mac users, but maybe restrict Ctrl+F on Windows if it conflicts
            // The user specifically complained about bash terminal conflict.
            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                e.preventDefault()
                setShowSearch((prev) => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('click', () => setContextMenu(null)) // Close menu on click

        // WebglAddon disabled for stability
        /*
                                                    try {
                                                      const webglAddon = new WebglAddon()
                                                      webglAddon.onContextLoss(() => { webglAddon.dispose(); });
                                                      term.loadAddon(webglAddon);
                                                    } catch(e) { console.warn("Webgl addon failed to load", e); }
                                                    */

        term.open(terminalRef.current)

        setTimeout(() => {
            fitAddon.fit()
        }, 100)

        // Send data to main process with ID
        term.onData((data) => {
            window.api.write(id, data)
        })

        // Receive data from main process
        const unsubscribe = window.api.onIncomingData((incomingId, data) => {
            if (incomingId !== id) return // Filter for this terminal

            if (!logModeRef.current) {
                try {
                    // Safety check against disposed terminal
                    if (xtermRef.current) {
                        xtermRef.current.write(data)
                    }
                } catch (e) {
                    console.error('Error writing to terminal:', e)
                }
            } else {
                bufferRef.current += data

                if (bufferRef.current.includes('\n')) {
                    const lines = bufferRef.current.split('\n')
                    const partial = lines.pop()

                    for (const line of lines) {
                        let formatted = formatLogLine(line)
                        formatted = formatted.replace(/\n/g, '\r\n')
                        term.writeln(formatted)
                    }

                    bufferRef.current = partial !== undefined ? partial : ''
                }

                if (flushTimerRef.current) clearTimeout(flushTimerRef.current)

                if (bufferRef.current.length > 0) {
                    flushTimerRef.current = setTimeout(() => {
                        if (bufferRef.current.length > 0) {
                            term.write(bufferRef.current)
                            bufferRef.current = ''
                        }
                    }, 10)
                }
            }
        })

        const handleResize = (): void => {
            // Check if element is visible
            if (!terminalRef.current || terminalRef.current.offsetParent === null) {
                return
            }
            try {
                fitAddon.fit()
                window.api.resize(id, term.cols, term.rows)
            } catch (e) {
                console.warn('Resize failed', e)
            }
        }

        // Initial resize
        setTimeout(handleResize, 100)
        window.addEventListener('resize', handleResize)

        xtermRef.current = term

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('resize', handleResize)
            unsubscribe()
            term.dispose()
            window.api.closeTerminal(id)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    // Handle theme updates
    useEffect(() => {
        if (xtermRef.current && theme) {
            xtermRef.current.options.theme = theme
        }
    }, [theme])

    // Handle resize when becoming active
    useEffect(() => {
        if (isActive && xtermRef.current && terminalRef.current && fitAddonRef.current) {
            // Small delay to ensure layout is computed
            setTimeout(() => {
                try {
                    // Only fit if visible
                    if (terminalRef.current?.offsetParent !== null && fitAddonRef.current) {
                        fitAddonRef.current.fit()
                        // Sync backend size
                        if (xtermRef.current) {
                            window.api.resize(id, xtermRef.current.cols, xtermRef.current.rows)
                        }
                    }
                } catch (e) {
                    console.error('Fit failed on activation', e)
                }
            }, 50)
        }
    }, [isActive])

    return (
        <div
            onContextMenu={(e) => {
                e.preventDefault()
                setContextMenu({ x: e.clientX, y: e.clientY })
            }}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                backgroundColor: theme?.background || '#0a0a0a'
            }}
        >
            {/* Context Menu */}
            {contextMenu && (
                <div
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        backgroundColor: '#252526',
                        border: '1px solid #454545',
                        borderRadius: '4px',
                        padding: '4px 0',
                        zIndex: 9999,
                        minWidth: '120px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}
                >
                    <div
                        onClick={() => {
                            setShowSearch(true)
                            setContextMenu(null)
                        }}
                        style={{
                            padding: '6px 12px',
                            cursor: 'pointer',
                            color: '#cccccc',
                            fontSize: '13px',
                            fontFamily: 'sans-serif',
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#094771')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                        <span>Find...</span>
                        <span style={{ color: '#888', fontSize: '11px' }}>Alt+F3</span>
                    </div>
                    <div
                        onClick={() => {
                            // Clipboard paste usually handled by xterm, but we can simulate or advise
                            if (navigator.clipboard) {
                                navigator.clipboard.readText().then(text => {
                                    window.api.write(id, text)
                                })
                            }
                            setContextMenu(null)
                        }}
                        style={{
                            padding: '6px 12px',
                            cursor: 'pointer',
                            color: '#cccccc',
                            fontSize: '13px',
                            fontFamily: 'sans-serif'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#094771')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                        Paste
                    </div>
                </div>
            )}
            <div
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 20,
                    zIndex: 1000,
                    display: 'flex',
                    gap: '10px'
                }}
            >
                <button
                    onClick={() => setLogMode(!logMode)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: logMode ? '#4caf50' : '#333',
                        color: 'white',
                        cursor: 'pointer',
                        fontFamily: 'sans-serif',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}
                >
                    {logMode ? 'LOG MODE: ON' : 'LOG MODE: OFF'}
                </button>
            </div>
            <div
                ref={terminalRef}
                style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden'
                }}
            />
            {showSearch && (
                <div
                    style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        zIndex: 1001,
                        backgroundColor: '#252526',
                        padding: '6px',
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: '1px solid #454545',
                        fontFamily: 'sans-serif'
                    }}
                >
                    <input
                        autoFocus
                        placeholder="Find"
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value)
                            if (e.target.value) {
                                searchAddonRef.current?.findNext(e.target.value, {
                                    incremental: true,
                                    caseSensitive: false
                                })
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                if (e.shiftKey) {
                                    searchAddonRef.current?.findPrevious(searchText, {
                                        caseSensitive: false
                                    })
                                } else {
                                    searchAddonRef.current?.findNext(searchText, { caseSensitive: false })
                                }
                            } else if (e.key === 'Escape') {
                                setShowSearch(false)
                                xtermRef.current?.focus()
                            }
                        }}
                        style={{
                            backgroundColor: '#3c3c3c',
                            border: 'none',
                            color: '#cccccc',
                            padding: '4px 8px',
                            borderRadius: '3px',
                            outline: 'none',
                            fontSize: '13px',
                            width: '180px'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '2px' }}>
                        <button
                            onClick={() =>
                                searchAddonRef.current?.findPrevious(searchText, {
                                    caseSensitive: false
                                })
                            }
                            style={{
                                background: '#333',
                                border: 'none',
                                color: '#ddd',
                                cursor: 'pointer',
                                borderRadius: '3px',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="Previous (Shift+Enter)"
                        >
                            ▲
                        </button>
                        <button
                            onClick={() => searchAddonRef.current?.findNext(searchText, { caseSensitive: false })}
                            style={{
                                background: '#333',
                                border: 'none',
                                color: '#ddd',
                                cursor: 'pointer',
                                borderRadius: '3px',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="Next (Enter)"
                        >
                            ▼
                        </button>
                    </div>
                    <button
                        onClick={() => {
                            setShowSearch(false)
                            xtermRef.current?.focus()
                        }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            marginLeft: '4px',
                            fontSize: '14px'
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    )
}
