const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Sample route
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);
