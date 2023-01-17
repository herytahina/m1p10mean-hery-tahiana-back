require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 3000; 
const app = express();
const mongoose = require('mongoose');
const usersRouter = require('./routes/users');

// database config
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'));

// middlewares config
app.use(express.json());

// routes config
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/users', usersRouter);

// app
app.listen(
    PORT, 
    ()=>console.log(`App running on http://localhost:${PORT}`)
);