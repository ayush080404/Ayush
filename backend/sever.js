require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// CONNECT TO MONGODB 
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch((err) => console.error('MongoDB connection error:', err));

//DEFINE OUR DATA BLUEPRINTS 
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// BRD COMPLIANT TASK SCHEMA
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, required: true, enum: ['Low', 'Medium', 'High'] },
    status: { type: String, required: true, enum: ['Pending', 'In Progress', 'Completed'] },
    dueDate: { type: String, required: true },
    assignedTo: { type: String, required: true },
    createdBy: { type: String, required: true }   
}, { timestamps: true }); 
const Task = mongoose.model('Task', taskSchema);

// SECURITY MIDDLEWARE (THE BOUNCER)
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; 
    if (!token) return res.status(403).json({ success: false, message: 'No token provided. Please log in.' });

    try {
        const decoded = jwt.verify(token, 'super_secret_key');
        req.user = decoded; 
        next(); 
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

// 4. AUTHENTICATION ROUTES
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ email, password: hashedPassword, role });
        res.json({ success: true, message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error registering user' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await User.findOne({ email, role });
        
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ email: user.email, role: user.role, id: user._id }, 'super_secret_key', { expiresIn: '1h' });
            res.json({ success: true, message: 'Login successful!', token: token });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials or role mismatch' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error logging in' });
    }
});

app.get('/api/tasks', verifyToken, async (req, res) => {
    try {
        let tasks;
        if (req.user.role === 'Manager' || req.user.role === 'Admin') {
            tasks = await Task.find(); 
        } else {
            tasks = await Task.find({ assignedTo: req.user.email }); 
        }
        res.json({ success: true, tasks: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching tasks' });
    }
});

app.post('/api/tasks', verifyToken, async (req, res) => {
    try {
        const taskData = { ...req.body, createdBy: req.user.email }; 
        const newTask = await Task.create(taskData); 
        res.json({ success: true, message: 'Task saved!', task: newTask });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving task' });
    }
});

app.delete('/api/tasks/:id', verifyToken, async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Task deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting task' });
    }
});

app.put('/api/tasks/:id', verifyToken, async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, message: 'Task updated!', task: updatedTask });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating task' });
    }
});

app.get('/api/users', verifyToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ success: false, message: 'Access denied' });
    try {
        
        const allUsers = await User.find().select('-password'); 
        res.json({ success: true, users: allUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
});

app.put('/api/users/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ success: false, message: 'Access denied' });
    try {
        const { role } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        res.json({ success: true, message: 'User role updated!', user: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating user' });
    }
});

app.delete('/api/users/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ success: false, message: 'Access denied' });
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User removed from system.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting user' });
    }
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});