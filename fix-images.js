const fs = require('fs');

let content = fs.readFileSync('src/lib/mockData.ts', 'utf8');

const workingPosters = [
  '/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', // Barbie
  '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', // Oppenheimer
];

const workingBackdrops = [
  '/nHf61UzkfFno5X1ofIhugCPus2R.jpg', // Barbie
  '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg', // Oppenheimer
];

content = content.replace(/poster_path:\s*'\/(.*?)'/g, (match, p1) => {
  return `poster_path: '${workingPosters[Math.floor(Math.random() * workingPosters.length)]}'`;
});

content = content.replace(/backdrop_path:\s*'\/(.*?)'/g, (match, p1) => {
  return `backdrop_path: '${workingBackdrops[Math.floor(Math.random() * workingBackdrops.length)]}'`;
});

fs.writeFileSync('src/lib/mockData.ts', content);
console.log('Fixed mock data images!');
