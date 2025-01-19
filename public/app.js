document.addEventListener('DOMContentLoaded', () => {
  const publicationsList = document.getElementById('publications-list');
  
  // Fetch scholar data
  fetch('/api/scholar')
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Clear loading message
      publicationsList.innerHTML = '';
      
      // Display publications
      data.publications.forEach(pub => {
        const pubElement = document.createElement('div');
        pubElement.className = 'publication';
        pubElement.innerHTML = `
          <h3>${pub.title}</h3>
          <div class="publication-meta">
            <span class="authors">${pub.authors}</span>
            <span class="year">${pub.year}</span>
            <span class="citations">Citations: ${pub.citation}</span>
          </div>
        `;
        publicationsList.appendChild(pubElement);
      });

      // Display stats
      const statsElement = document.createElement('div');
      statsElement.className = 'stats';
      statsElement.innerHTML = `
        <h3>Research Metrics</h3>
        <div class="stats-grid">
          <div class="stat">
            <span class="stat-value">${data.stats.citations}</span>
            <span class="stat-label">Total Citations</span>
          </div>
          <div class="stat">
            <span class="stat-value">${data.stats.hIndex}</span>
            <span class="stat-label">h-index</span>
          </div>
          <div class="stat">
            <span class="stat-value">${data.stats.i10Index}</span>
            <span class="stat-label">i10-index</span>
          </div>
        </div>
      `;
      publicationsList.insertAdjacentElement('beforebegin', statsElement);
    })
    .catch(error => {
      console.error('Error:', error);
      publicationsList.innerHTML = `<p class="error">Failed to load publications. Please try again later.</p>`;
    });
});
