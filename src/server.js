require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // Keep log simple; avoid leaking env details
  console.log(`API listening on http://localhost:${PORT}`);
});
