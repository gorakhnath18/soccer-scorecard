 const matchesContainer = document.getElementById('matches');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sortOrder');
const venueFilter = document.getElementById('venueFilter');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const toggleModeBtn = document.getElementById('toggleMode');

const pageSize = 4; // matches per load
let currentPage = 1;

const matchesData = [
  {
    teams: 'India vs Australia',
    date: '2025-06-01T15:00:00',
    venue: 'Mumbai Stadium',
  },
  {
    teams: 'Brazil vs Argentina',
    date: '2025-06-03T18:30:00',
    venue: 'Maracanã',
  },
  {
    teams: 'Spain vs Germany',
    date: '2025-06-05T20:00:00',
    venue: 'Camp Nou',
  },
  {
    teams: 'France vs Italy',
    date: '2025-06-07T17:00:00',
    venue: 'Stade de France',
  },
  {
    teams: 'England vs Netherlands',
    date: '2025-06-10T19:30:00',
    venue: 'Wembley',
  },
  {
    teams: 'Portugal vs Belgium',
    date: '2025-06-12T16:00:00',
    venue: 'Estádio da Luz',
  },
  {
    teams: 'Netherlands vs Germany',
    date: '2025-06-15T18:00:00',
    venue: 'Johan Cruyff Arena',
  },
  {
    teams: 'USA vs Canada',
    date: '2025-06-18T19:00:00',
    venue: 'Rose Bowl',
  },
  {
    teams: 'Mexico vs Colombia',
    date: '2025-06-20T21:00:00',
    venue: 'Azteca Stadium',
  },
  {
    teams: 'Japan vs South Korea',
    date: '2025-06-22T18:00:00',
    venue: 'Saitama Stadium',
  },
];

// Calculate match status
// Completed if date < now - 2 hours
// Live if date between now-2h and now+2h
// Upcoming otherwise
function getStatus(dateStr) {
  const now = new Date();
  const matchDate = new Date(dateStr);
  const twoHours = 2 * 60 * 60 * 1000;

  if (matchDate.getTime() + twoHours < now.getTime()) return 'completed';
  if (matchDate.getTime() - twoHours <= now.getTime() && matchDate.getTime() + twoHours >= now.getTime()) return 'live';
  return 'upcoming';
}

// Format date nicely
function formatDate(dateStr) {
  const options = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateStr).toLocaleString('en-US', options);
}

// Countdown timer for upcoming matches
function getCountdown(dateStr) {
  const now = new Date();
  const matchDate = new Date(dateStr);
  const diff = matchDate - now;

  if (diff <= 0) return 'Started';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return `${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m`;
}

// Render matches on page with pagination
function renderMatches(data, page = 1) {
  if (page === 1) matchesContainer.innerHTML = '';

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageMatches = data.slice(start, end);

  pageMatches.forEach(match => {
    const card = document.createElement('div');
    card.className = 'match-card';

    const status = getStatus(match.date);
    const statusClass = `status-${status}`;
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);

    card.innerHTML = `
      <div class="status-tag ${statusClass}">${statusText}</div>
      <div class="match-title">${match.teams}</div>
      <div class="match-details">
        <span><strong>Date:</strong> ${formatDate(match.date)}</span><br />
        <span><strong>Venue:</strong> ${match.venue}</span>
      </div>
      ${
        status === 'upcoming'
          ? `<div class="countdown">Starts in: ${getCountdown(match.date)}</div>`
          : ''
      }
    `;

    matchesContainer.appendChild(card);
  });

  // Hide or show load more button
  if (end >= data.length) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'block';
  }
}

// Search filter
function filterMatches() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const venueTerm = venueFilter.value;
  let filtered = matchesData.filter(m => {
    const teamMatch = m.teams.toLowerCase().includes(searchTerm);
    const venueMatch = venueTerm ? m.venue === venueTerm : true;
    return teamMatch && venueMatch;
  });

  // Sort
  if (sortSelect.value === 'asc') {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortSelect.value === 'desc') {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortSelect.value === 'status') {
    // Sort by status: live > upcoming > completed
    const order = { live: 1, upcoming: 2, completed: 3 };
    filtered.sort((a, b) => order[getStatus(a.date)] - order[getStatus(b.date)]);
  }

  currentPage = 1;
  renderMatches(filtered, currentPage);
  filteredMatches = filtered;
}

let filteredMatches = [...matchesData];

// Populate venue filter dropdown dynamically
function populateVenues() {
  const venues = [...new Set(matchesData.map(m => m.venue))].sort();
  venues.forEach(venue => {
    const option = document.createElement('option');
    option.value = venue;
    option.textContent = venue;
    venueFilter.appendChild(option);
  });
}

// Load more matches button
loadMoreBtn.addEventListener('click', () => {
  currentPage++;
  renderMatches(filteredMatches, currentPage);
});

// Search input event
searchInput.addEventListener('input', filterMatches);
venueFilter.addEventListener('change', filterMatches);
sortSelect.addEventListener('change', filterMatches);

// Dark/light mode toggle
toggleModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  toggleModeBtn.textContent = isLight ? '🌞' : '🌙';
});

// Update countdown timers every minute for upcoming matches
function updateCountdowns() {
  const cards = document.querySelectorAll('.match-card');
  cards.forEach(card => {
    const statusTag = card.querySelector('.status-tag');
    if (statusTag && statusTag.textContent.toLowerCase() === 'upcoming') {
      const teams = card.querySelector('.match-title').textContent;
      const match = filteredMatches.find(m => m.teams === teams);
      if (!match) return;
      const countdownEl = card.querySelector('.countdown');
      if (countdownEl) {
        countdownEl.textContent = 'Starts in: ' + getCountdown(match.date);
      }
    }
  });
}

// Initial setup
populateVenues();
filterMatches();

// Update countdown every 60 seconds
setInterval(updateCountdowns, 60000);
