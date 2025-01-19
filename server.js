const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for development
app.use(cors());

// Serve static files
app.use(express.static('public'));

// Cache for storing scholar data
const scholarCache = {
  data: null,
  lastFetch: 0
};

// Endpoint to fetch scholar data
app.get('/api/scholar', async (req, res) => {
  try {
    // Use cached data if available and not older than 1 hour
    if (scholarCache.data && Date.now() - scholarCache.lastFetch < 3600000) {
      return res.json(scholarCache.data);
    }

    // Fetch Google Scholar page
    const response = await fetch('https://scholar.google.com/citations?user=VU5PNaIAAAAJ&hl=en');
    const html = await response.text();
    const $ = cheerio.load(html);

    // Parse publications
    const publications = [];
    $('#gsc_a_b .gsc_a_tr').each((i, el) => {
      const title = $(el).find('.gsc_a_at').text().trim();
      const authors = $(el).find('.gs_gray').first().text().trim();
      const citation = $(el).find('.gsc_a_ac').text().trim() || '0';
      const year = $(el).find('.gsc_a_hc').text().trim();

      console.log('Publication:', {
        title,
        authors,
        citation,
        year
      });

      publications.push({
        title,
        authors,
        citation,
        year
      });
    });

    // Parse stats
    const stats = {
      citations: $('#gsc_rsb_st tbody tr:nth-child(1) td:nth-child(2)').text().trim(),
      hIndex: $('#gsc_rsb_st tbody tr:nth-child(2) td:nth-child(2)').text().trim(),
      i10Index: $('#gsc_rsb_st tbody tr:nth-child(3) td:nth-child(2)').text().trim()
    };

    // Update cache
    scholarCache.data = { publications, stats };
    scholarCache.lastFetch = Date.now();

    res.json({ publications, stats });
  } catch (error) {
    console.error('Error fetching scholar data:', error);
    res.status(500).json({ error: 'Failed to fetch scholar data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
