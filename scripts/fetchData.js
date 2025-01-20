const fs = require('fs');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require('cheerio');

const fetchData = async () => {
  try {
    const url = `https://scholar.google.com/citations?user=${process.env.SCHOLAR_USER_ID}&hl=en`;
    console.log('Fetching data from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Response status:', response.status);
      console.error('Response headers:', response.headers);
      throw new Error(`Scholar page request failed with status ${response.status}`);
    }
    
    const html = await response.text();
    console.log('HTML content length:', html.length);
    const $ = cheerio.load(html);

    // Parse publications
    const publications = [];
    $('#gsc_a_b .gsc_a_tr').each((i, el) => {
      const title = $(el).find('.gsc_a_at').text().trim();
      const authors = $(el).find('.gs_gray').first().text().trim();
      const citation = $(el).find('.gsc_a_ac').text().trim() || '0';
      const year = $(el).find('.gsc_a_hc').text().trim();

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

    // Save data to public folder
    const data = { publications, stats };
    fs.writeFileSync('public/data/scholar.json', JSON.stringify(data));
    console.log('Data successfully fetched and saved');
  } catch (error) {
    console.error('Error fetching scholar data:', error);
    process.exit(1);
  }
};

fetchData();
