/**
 * CSV Export Service
 *
 * Generates an Excel-compatible CSV string for event participants.
 * Uses BOM (Byte Order Mark) prefix for correct UTF-8 handling in Excel.
 * No external dependencies — pure string manipulation.
 */

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Escape a CSV field value.  Wraps in double-quotes if the value
 * contains a comma, double-quote, or newline.
 */
function escapeCSV(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

// ── Main export function ─────────────────────────────────────────────

/**
 * @param {Object} event        – Mongoose event document
 * @param {Array}  participants  – Array of populated User documents
 * @returns {string}            – Complete CSV string (BOM-prefixed)
 */
function generateParticipantCSV(event, participants) {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility

  const headers = [
    'S.No',
    'Name',
    'Email',
    'College',
    'Institution Type',
    'Registration Date',
  ];

  const rows = participants.map((p, index) => [
    index + 1,
    escapeCSV(p.name),
    escapeCSV(p.email),
    escapeCSV(p.college),
    escapeCSV(p.institutionType),
    escapeCSV(formatDate(p.createdAt)),
  ]);

  const headerLine = headers.map(escapeCSV).join(',');
  const dataLines  = rows.map(row => row.join(','));

  return BOM + [headerLine, ...dataLines].join('\r\n') + '\r\n';
}

module.exports = { generateParticipantCSV };
