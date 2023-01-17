const express = require('express');
const PORT = process.env.PORT || 3000; 
const app = express();
const usersRouter = require('./routes/users');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/users', usersRouter);

app.listen(
    PORT, 
    ()=>console.log(`App running on http://localhost:${PORT}`)
);