/**
 * Password Security Hub — Export Utility
 * Export data as TXT or CSV files
 */

/**
 * Download content as a text file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export an array of strings as a TXT file (one per line)
 * @param {string[]} items - Items to export
 * @param {string} filename - File name (default: 'passwords.txt')
 */
export function exportAsTXT(items, filename = 'passwords.txt') {
  const content = items.join('\n');
  downloadFile(content, filename, 'text/plain;charset=utf-8');
}

/**
 * Export data as CSV
 * @param {string[]} headers - Column headers
 * @param {Array<Array<string>>} rows - Data rows
 * @param {string} filename - File name (default: 'passwords.csv')
 */
export function exportAsCSV(headers, rows, filename = 'passwords.csv') {
  const escapeField = (field) => {
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.map(escapeField).join(','),
    ...rows.map(row => row.map(escapeField).join(','))
  ];

  const content = lines.join('\n');
  downloadFile(content, filename, 'text/csv;charset=utf-8');
}
