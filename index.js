const express = require('express');
const socket = require('socket.io');
const mysql = require('mysql2');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socket(server);

const db = mysql.createConnection({
    host: 'db',
    user: 'root',
    password: 'root_password',
    database: 'chat',
    port: 3306,
});

db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to MySQL');
    }
});

// creat table message if not exists with columns id, message, created_at, user 
db.query('CREATE TABLE IF NOT EXISTS message (id INT AUTO_INCREMENT PRIMARY KEY, message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, user VARCHAR(255))', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Table created');
    }
});

app.use(express.static('public'));

// LES REQUETES
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// SOCKET IO
io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('MessageDuMonsieur', (contenuDuMessage) => {
        console.log(contenuDuMessage);
        io.emit('MessageDuMonsieur', contenuDuMessage);
    });
});

//send messagedumonsieur to database
io.on('connection', (socket) => {
    socket.on('MessageDuMonsieur', (contenuDuMessage) => {
        let message = contenuDuMessage.message;
        let pseudo = contenuDuMessage.pseudo;
        db.query('INSERT INTO message (message, user) VALUES (?, ?)', [message, pseudo], (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Message added to database');
            }
        });
    });

    //get all messages from database and send them to the client
    db.query('SELECT * FROM message', (err, results) => {
        if (err) {
            console.log(err);
        } else {
            socket.emit('allMessages', results);
        }
    });
});

// LANCEMENT DU SERVEUR
server.listen(3006, () => {
    console.log('Server running on port 3006');
});