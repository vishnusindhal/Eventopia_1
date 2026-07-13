/**
 * Export Controller
 *
 * Handles participant data retrieval and file exports (PDF, CSV)
 * for event organizers and admins.
 *
 * Every handler follows the same pattern:
 *   1. Validate input
 *   2. Authorize (event owner OR admin)
 *   3. Call the appropriate service
 *   4. Return the response
 */

const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
const { generateParticipantPDF } = require('../services/pdfExportService');
const { generateParticipantCSV } = require('../services/csvExportService');

// ── Private helper: load event + verify ownership ────────────────────

async function loadAndAuthorize(req, res) {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid event ID format' });
    return null;
  }

  const event = await Event.findById(id);

  if (!event) {
    res.status(404).json({ success: false, message: 'Event not found' });
    return null;
  }

  // Authorization: event owner or admin
  if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Not authorized to access participant data for this event' });
    return null;
  }

  return event;
}

// ── Private helper: fetch populated participants ─────────────────────

async function getPopulatedParticipants(event) {
  const populated = await Event.findById(event._id)
    .populate({
      path: 'registeredUsers',
      select: 'name email college institutionType createdAt',
    });

  return populated.registeredUsers || [];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Handler 1: Get paginated participants (JSON)
// GET /api/events/:id/participants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

exports.getEventParticipants = async (req, res) => {
  try {
    const event = await loadAndAuthorize(req, res);
    if (!event) return; // Response already sent

    const allParticipants = await getPopulatedParticipants(event);

    // ── Search filter ──
    const { search = '', page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc' } = req.query;

    let filtered = allParticipants;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = allParticipants.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.college && p.college.toLowerCase().includes(q))
      );
    }

    // ── Sort ──
    const validSortFields = ['name', 'email', 'college', 'institutionType', 'createdAt'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder === 'desc' ? -1 : 1;

    filtered.sort((a, b) => {
      const aVal = (a[field] || '').toString().toLowerCase();
      const bVal = (b[field] || '').toString().toLowerCase();
      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });

    // ── Paginate ──
    const pageNum  = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const total    = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIdx = (pageNum - 1) * pageSize;
    const paginated = filtered.slice(startIdx, startIdx + pageSize);

    res.status(200).json({
      success: true,
      event: {
        _id: event._id,
        title: event.title,
        college: event.college,
        institutionType: event.institutionType,
        type: event.type,
        date: event.date,
        status: event.status,
        organizer: event.organizer,
        venue: event.venue,
        registrationDeadline: event.registrationDeadline,
        totalRegistrations: allParticipants.length,
        createdAt: event.createdAt,
      },
      participants: paginated,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('[ExportController] getEventParticipants error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching participants' });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Handler 2: Export participants as PDF
// GET /api/events/:id/export/pdf
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

exports.exportParticipantsPDF = async (req, res) => {
  try {
    const event = await loadAndAuthorize(req, res);
    if (!event) return;

    const participants = await getPopulatedParticipants(event);

    // Generate PDF stream
    const pdfStream = generateParticipantPDF(event, participants);

    // Sanitize filename
    const safeName = event.title.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_');
    const filename = `${safeName}_Participants.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    pdfStream.pipe(res);

    pdfStream.on('error', (err) => {
      console.error('[ExportController] PDF stream error:', err);
      // Response headers already sent; just end the stream
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'PDF generation failed' });
      }
    });
  } catch (error) {
    console.error('[ExportController] exportParticipantsPDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error during PDF export' });
    }
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Handler 3: Export participants as CSV
// GET /api/events/:id/export/csv
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

exports.exportParticipantsCSV = async (req, res) => {
  try {
    const event = await loadAndAuthorize(req, res);
    if (!event) return;

    const participants = await getPopulatedParticipants(event);

    const csvContent = generateParticipantCSV(event, participants);

    // Sanitize filename
    const safeName = event.title.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_');
    const filename = `${safeName}_Participants.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(csvContent);
  } catch (error) {
    console.error('[ExportController] exportParticipantsCSV error:', error);
    res.status(500).json({ success: false, message: 'Server error during CSV export' });
  }
};
