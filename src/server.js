const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

// Create the Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Data file path
const COMPLAINTS_FILE = path.join(__dirname, '../data/complaints.json');

// Initialize complaints file if it doesn't exist
if (!fs.existsSync(COMPLAINTS_FILE)) {
    fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify([]));
}

// Get all beefs
app.get('/api/beefs', (req, res) => {
    try {
        const beefs = JSON.parse(fs.readFileSync(COMPLAINTS_FILE));
        res.json(beefs);
    } catch (error) {
        console.error('Error reading beefs:', error);
        res.status(500).json({ error: 'Failed to retrieve beefs' });
    }
});

// Add a new beef
app.post('/api/beefs', (req, res) => {
    try {
        const { title, content } = req.body;
        
        // Basic validation
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        
        // Read existing beefs
        const beefs = JSON.parse(fs.readFileSync(COMPLAINTS_FILE));
        
        // Create new beef
        const newBeef = {
            id: Date.now().toString(),
            title,
            content,
            date: new Date().toISOString()
        };
        
        // Add the new beef to the array
        beefs.push(newBeef);
        
        // Save the updated beefs
        fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify(beefs, null, 2));
        
        res.status(201).json(newBeef);
    } catch (error) {
        console.error('Error adding beef:', error);
        res.status(500).json({ error: 'Failed to add beef' });
    }
});

// Delete a beef by ID
app.delete('/api/beefs/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        // Read existing beefs
        const beefs = JSON.parse(fs.readFileSync(COMPLAINTS_FILE));
        
        // Find the index of the beef with the given ID
        const beefIndex = beefs.findIndex(beef => beef.id === id);
        
        // If beef not found
        if (beefIndex === -1) {
            return res.status(404).json({ error: 'Beef not found' });
        }
        
        // Remove the beef from the array
        beefs.splice(beefIndex, 1);
        
        // Save the updated beefs
        fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify(beefs, null, 2));
        
        res.status(200).json({ message: 'Beef deleted successfully' });
    } catch (error) {
        console.error('Error deleting beef:', error);
        res.status(500).json({ error: 'Failed to delete beef' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Butcher Beef server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
