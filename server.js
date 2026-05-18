const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const laporanRoutes = require("./routes/laporanRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notifikasiRoutes = require("./routes/notifikasiRoutes");
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifikasi", notifikasiRoutes);

app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

app.get(['/api-docs', '/api-docs/'], (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>API WadulGuse Docs</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>

        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function() {
            SwaggerUIBundle({
              url: '/api-docs.json',
              dom_id: '#swagger-ui',
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              layout: 'StandaloneLayout',
              persistAuthorization: true
            });
          };
        </script>
      </body>
    </html>
  `);
});

app.get('/', (req, res) => {
  res.json({
    message: 'API WadulGuse berhasil berjalan',
  });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Swagger berjalan di http://localhost:${PORT}/api-docs`);
  });
}