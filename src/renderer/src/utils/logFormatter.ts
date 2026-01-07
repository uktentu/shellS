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

export const formatLogLine = (line: string): string => {
  // Attempt to find JSON substring
  // This is a naive implementation; for complex logs, we might need more robust parsing
  const firstBrace = line.indexOf('{')
  const lastBrace = line.lastIndexOf('}')

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const potentialJson = line.substring(firstBrace, lastBrace + 1)
    const formatted = tryFormatJSON(potentialJson)
    if (formatted) {
      return line.substring(0, firstBrace) + '\n' + formatted + '\n' + line.substring(lastBrace + 1)
    }
  }

  return line
}
