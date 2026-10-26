import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function storeDataSyncPlugin(): Plugin {
  return {
    name: 'store-data-sync',
    configureServer(server) {
      const dataFilePath = path.resolve(__dirname, 'src/data/store-data.json');

      server.middlewares.use('/api/store-data', (req, res, next) => {
        if (req.method === 'GET') {
          if (fs.existsSync(dataFilePath)) {
            const data = fs.readFileSync(dataFilePath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(data);
          } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'No custom store data file yet' }));
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              JSON.parse(body); // Validate JSON
              fs.writeFileSync(dataFilePath, body, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, timestamp: new Date().toISOString() }));
            } catch (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), storeDataSyncPlugin()],
  server: {
    host: true, // Exposes to local network so you can open on phone/tablet
  },
})
