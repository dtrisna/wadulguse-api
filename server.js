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

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'API WadulGuse berhasil berjalan',
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log(`Swagger berjalan di http://localhost:${PORT}/api-docs`);
});