const express = require('express');
const router = express.Router();

router.route('/')
.get((req, res) => {
    console.log('GET /users');
})
.post((req, res) => {
    console.log('POST /users');
});

module.exports = router;