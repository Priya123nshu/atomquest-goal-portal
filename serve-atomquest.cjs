const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve('E:/atomquest');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.md': 'text/markdown; charset=utf-8' };
const server = http.createServer((req, res) => {
  const clean = decodeURIComponent(req.url.split('?')[0]);
  const relative = clean === '/' ? 'index.html' : clean.replace(/^\/+/, '');
  let file = path.resolve(root, relative);
  if (!file.toLowerCase().startsWith(root.toLowerCase())) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});
server.listen(4173, '0.0.0.0', () => console.log('AtomQuest portal running at http://127.0.0.1:4173'));
