export function csvEscape(value: any): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  // Escape quotes by doubling them
  const escaped = s.replace(/"/g, '""')
  // Wrap in quotes if contains comma, quote, or newline
  if (/[",\n\r]/.test(escaped)) return `"${escaped}"`
  return escaped
}

export function toCsv(headers: string[], rows: Array<Record<string, any>>): string {
  const headerLine = headers.map(csvEscape).join(',')
  const lines = rows.map((row) => headers.map((h) => csvEscape(row[h])).join(','))
  return [headerLine, ...lines].join('\n')
}

export function downloadTextFile(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}


