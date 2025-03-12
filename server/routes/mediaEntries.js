const express = require('express');
const router = express.Router();
const MediaEntry = require('../models/mediaEntry');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.post('/', authenticateToken, authorizeRole(['analyst']), async (req, res) => {
    try {
        const entryId = await MediaEntry.create(req.body, req.user.id);
        res.status(201).json({ id: entryId, message: 'Entry created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating entry' });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, ...filters } = req.query;
        const entries = await MediaEntry.getAll(filters, parseInt(page), parseInt(limit));
        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching entries' });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const entry = await MediaEntry.getById(req.params.id);
        if (!entry) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.json(entry);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching entry' });
    }
});

router.put('/:id', authenticateToken, authorizeRole(['analyst']), async (req, res) => {
    try {
        const updated = await MediaEntry.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.json({ message: 'Entry updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating entry' });
    }
});

router.delete('/:id', authenticateToken, authorizeRole(['analyst', 'supervisor']), async (req, res) => {
    try {
        const deleted = await MediaEntry.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting entry' });
    }
});

module.exports = router;