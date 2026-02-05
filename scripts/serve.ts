import { renderMarkdown, createHtmlTemplate } from '../src/utils/markdown';
import * as http from 'http';

const PORT = 3000;

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const path = url.pathname;

  if (path === '/' || path === '/index.html') {
    const html = createHtmlTemplate('Markdown to PDF', '');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else if (path.startsWith('/api/render') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { markdown } = JSON.parse(body);
        const html = renderMarkdown(markdown);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ html }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
