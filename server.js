const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/config');
const userRoutes = require('./routes/userRoutes');
const walletRoutes = require('./routes/walletRoutes');
const cors = require('cors');   // <-- import cors
const path = require('path');
dotenv.config();
connectDB();

const app = express();

// ✅ Enable CORS
app.use(cors({
  origin: "http://localhost:8080",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use((req, res, next) => {
  res.removeHeader("Content-Security-Policy");
  next();
});

app.use(express.json());
app.use(express.json());
const angularDistPath = path.join(__dirname, 'dist');
app.use(express.static(angularDistPath));

// Serve index.html for all other routes (for Angular routing)
app.get('/', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});
app.use('/uploads', express.static('public/uploads'));

app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
