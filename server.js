const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'www')));

// Replace the app.get('*', ...) with this:
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`Servidor frontend escuchando en puerto ${port}`)
);
