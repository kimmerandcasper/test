const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = 8080;

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect('mongodb://mongodb:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    console.log('Received data:', { username, email, password });
    
    const usernameRegEx = /^[a-zA-Z0-9]{1,6}$/;
    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegEx = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,}$/;
    
    if (!usernameRegEx.test(username)) {
        console.log('Validation failed: Username pattern mismatch');
        return res.status(400).json({ message: 'The username did not match the expected pattern.' });
    }

    if (!emailRegEx.test(email)) {
        console.log('Validation failed: Email pattern mismatch');
        return res.status(400).json({ message: 'The email did not match the expected pattern.' });
    }

    if (!passwordRegEx.test(password)) {
        console.log('Validation failed: Password pattern mismatch');
        return res.status(400).json({ message: 'The password did not match the expected pattern.' });
    }

    try {
        const newUser = new User({ username, email, password });
        await newUser.save();
        console.log('User registered:', newUser);
        res.status(201).json({ message: 'User registered' });
    } catch (error) {
        console.log('Error during registration:', error);
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        res.status(500).json({ message: 'Server error', error });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            res.status(200).json({ message: 'Login successful', accessToken: 'fake-access-token', refreshToken: 'fake-refresh-token' });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.log('Login error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});