const express = require('express');
const router = express.Router();
const supabase = require('./supabase');

// Get all recordings
router.get('/recordings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching recordings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific recording by ID
router.get('/recordings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching recording:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save a new recording
router.post('/recordings', async (req, res) => {
  try {
    const { title, melody } = req.body;
    
    if (!title || !melody) {
      return res.status(400).json({ error: 'Title and melody are required' });
    }
    
    const { data, error } = await supabase
      .from('recordings')
      .insert([
        { title, melody }
      ])
      .select();
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error saving recording:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update an existing recording
router.put('/recordings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, melody } = req.body;
    
    const { data, error } = await supabase
      .from('recordings')
      .update({ title, melody })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    res.json(data[0]);
  } catch (error) {
    console.error('Error updating recording:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a recording
router.delete('/recordings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('recordings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting recording:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
