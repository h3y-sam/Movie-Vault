const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/TMDB_ACCESS_TOKEN=(.+)/);
if (!match) {
  console.error('TMDB_ACCESS_TOKEN not found in .env.local');
  process.exit(1);
}

const token = match[1].trim();
console.log('Found Token (truncated):', token.slice(0, 15) + '...');

fetch('https://api.themoviedb.org/3/trending/all/week', {
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${token}`
  }
})
.then(res => {
  console.log('HTTP Status:', res.status);
  return res.json();
})
.then(data => {
  if (data.results) {
    console.log('Success! Fetched', data.results.length, 'trending items.');
    console.log('First Item:', data.results[0].title || data.results[0].name);
  } else {
    console.log('Error payload:', data);
  }
})
.catch(err => {
  console.error('Network Error:', err);
});
