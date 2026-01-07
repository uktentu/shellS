import React, { useState } from 'react'
import { Terminal } from './Terminal'
import { themes } from '../utils/themes'

interface Tab {
  id: string
  title: string
}

export const TerminalManager: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([{ id: '1', title: 'Shell 1' }])
  const [activeTabId, setActiveTabId] = useState<string>('1')
  const [currentTheme, setCurrentTheme] = useState<string>('obsidian')

  const addTab = (): void => {
    const newId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`
    console.log('Creating new tab with ID:', newId)
    setTabs([...tabs, { id: newId, title: `Shell ${tabs.length + 1}` }])
    setActiveTabId(newId)
  }

  const removeTab = (e: React.MouseEvent, id: string): void => {
    e.stopPropagation()
    if (tabs.length === 1) return // Prevent closing last tab

    const newTabs = tabs.filter((t) => t.id !== id)
    setTabs(newTabs)
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id)
    }
  }

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: themes[currentTheme].theme.background
      }}
    >
      {/* Tab Bar */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#111',
          height: '36px',
          alignItems: 'center',
          paddingLeft: '10px',
          borderBottom: `1px solid ${themes[currentTheme].theme.selectionBackground}`
        }}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            style={{
              padding: '0 15px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              backgroundColor:
                activeTabId === tab.id ? themes[currentTheme].theme.background : 'transparent',
              color: activeTabId === tab.id ? themes[currentTheme].theme.foreground : '#888',
              borderRight: '1px solid #333',
              fontSize: '13px',
              minWidth: '100px',
              justifyContent: 'space-between',
              userSelect: 'none'
            }}
          >
            <span>{tab.title}</span>
            <span
              onClick={(e) => removeTab(e, tab.id)}
              style={{ marginLeft: '10px', fontSize: '14px', opacity: 0.6 }}
            >
              ×
            </span>
          </div>
        ))}
        <div
          onClick={addTab}
          style={{
            width: '36px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#888',
            fontSize: '18px'
          }}
        >
          +
        </div>

        <div style={{ flexGrow: 1 }} />

        {/* Theme Switcher */}
        <select
          value={currentTheme}
          onChange={(e) => setCurrentTheme(e.target.value)}
          style={{
            marginRight: '10px',
            backgroundColor: '#222',
            color: '#eee',
            border: '1px solid #444',
            padding: '4px',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          {Object.keys(themes).map((key) => (
            <option key={key} value={key}>
              {themes[key].name}
            </option>
          ))}
        </select>
      </div>

      {/* Terminal Content */}
      <div style={{ flexGrow: 1, position: 'relative' }}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            style={{
              display: activeTabId === tab.id ? 'block' : 'none',
              height: '100%',
              width: '100%'
            }}
          >
            <Terminal
              id={tab.id}
              theme={themes[currentTheme].theme}
              isActive={activeTabId === tab.id}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
