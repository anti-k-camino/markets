const express = require('express');
const router = express.Router();

// Do work here
router.get('/', (req, res) => {
  res.send('Markets!');
});

module.exports = router;
