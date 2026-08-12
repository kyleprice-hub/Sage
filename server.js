const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'items.json');

function ensureDataFile() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
}

app.use(express.json({ limit: '5mb' }));

// Board data API - single shared JSON blob, source of truth for all devices.
app.get('/api/items', (req, res) => {
    ensureDataFile();
    try {
          res.type('application/json').send(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (err) {
          console.error('Failed to read data file', err);
          res.status(500).json({ error: 'read failed' });
    }
});

app.post('/api/items', (req, res) => {
    ensureDataFile();
    if (!Array.isArray(req.body)) {
          return res.status(400).json({ error: 'expected an array of items' });
    }
    try {
          fs.writeFileSync(DATA_FILE, JSON.stringify(req.body));
          res.json({ ok: true, count: req.body.length });
    } catch (err) {
          console.error('Failed to write data file', err);
          res.status(500).json({ error: 'write failed' });
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Sage running on port ${PORT}`);
});
