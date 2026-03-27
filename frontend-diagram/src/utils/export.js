/**
 * Copy SVG code to clipboard
 * @param {string} svgCode - SVG markup to copy
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export async function copySvgToClipboard(svgCode) {
  try {
    await navigator.clipboard.writeText(svgCode)
    return true
  } catch (error) {
    console.error('Failed to copy SVG:', error)
    return false
  }
}

/**
 * Download SVG file
 * @param {string} svgCode - SVG markup to download
 * @param {string} filename - Filename for the download (without .svg extension)
 */
export function downloadSvg(svgCode, filename) {
  try {
    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return true
  } catch (error) {
    console.error('Failed to download SVG:', error)
    return false
  }
}

/**
 * Generate default filename with timestamp
 * @returns {string} - Filename like "diagram-2026-03-27-143025"
 */
export function generateDefaultFilename() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `diagram-${year}-${month}-${day}-${hours}${minutes}${seconds}`
}
