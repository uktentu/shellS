const COLORS = {
  reset: '\x1b[0m',
  key: '\x1b[34m', // Blue
  string: '\x1b[32m', // Green
  number: '\x1b[33m', // Yellow
  boolean: '\x1b[35m', // Magenta
  null: '\x1b[90m' // Gray
}

export const tryFormatJSON = (text: string): string | null => {
  try {
    const trimmed = text.trim()
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      const parsed = JSON.parse(trimmed)
      // Custom colored stringify
      const json = JSON.stringify(parsed, null, 2)
      return json.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
        (match) => {
          let cls = COLORS.number
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = COLORS.key
            } else {
              cls = COLORS.string
            }
          } else if (/true|false/.test(match)) {
            cls = COLORS.boolean
          } else if (/null/.test(match)) {
            cls = COLORS.null
          }
          return cls + match + COLORS.reset
        }
      )
    }
  } catch {
    return null
  }
  return null
}

// Helper to strip ANSI codes for clean parsing
const stripAnsi = (str: string): string => {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

export const formatLogLine = (line: string): string => {
  // 1. Clean line of ANSI codes to find braces accurately
  const cleanLine = stripAnsi(line)
  
  const firstBrace = cleanLine.indexOf('{')
  const lastBrace = cleanLine.lastIndexOf('}')

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    // Extract the potential JSON part from the CLEAN line
    const potentialJson = cleanLine.substring(firstBrace, lastBrace + 1)
    const formatted = tryFormatJSON(potentialJson)
    
    if (formatted) {
      // If we successfully formatted it, return it.
      // Note: We might lose the original ANSI coloring of the REST of the line here
      // but "Log Mode" usually implies we want to see the JSON clearly.
      // We reconstruct: prefix (from original if possible? tricky due to indices)
      // Simpler: Just return prefix + formatted + suffix from clean line
      return cleanLine.substring(0, firstBrace) + '\n' + formatted + '\n' + cleanLine.substring(lastBrace + 1)
    }
  }

  return line
}
