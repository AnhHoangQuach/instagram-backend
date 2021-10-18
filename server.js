const express = require('express');
const connectToDb = require('./utils/db');
const app = express();
const PORT = process.env.PORT || 5000;

connectToDb();

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
