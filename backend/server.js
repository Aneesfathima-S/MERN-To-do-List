const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json()); // Middleware for JSON parsing
app.use(cors()); // Enable CORS

// Connecting to MongoDB
mongoose.connect('mongodb://localhost:27017/to-do')
    .then(() => console.log("✅ MongoDB Connected!"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Create Schema
const todoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    alert: {
        date: { type: String, required: false },  // Format: YYYY-MM-DD
        time: { type: String, required: false },  // Format: HH:MM
        phone: { type: String, required: false }  // User phone number
    }
}, { timestamps: true }); // Adds `createdAt` and `updatedAt`

// Create Model
const Todo = mongoose.model('Todo', todoSchema);

// ✅ Create a new Todo (POST)
app.post('/todos', async (req, res) => {
    try {
        const { title, description, alert } = req.body;

        // Validate alert structure
        if (alert && (!alert.date || !alert.time || !alert.phone)) {
            return res.status(400).json({ message: "Alert must have date, time, and phone." });
        }

        const newTodo = new Todo({ title, description, alert });
        await newTodo.save();
        res.status(201).json(newTodo);
    } catch (error) {
        console.error('❌ Error creating todo:', error);
        res.status(500).json({ message: error.message });
    }
});

// ✅ Get all Todos (GET)
app.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (error) {
        console.error('❌ Error fetching todos:', error);
        res.status(500).json({ message: error.message });
    }
});

// ✅ Update a Todo (PUT) [This Fixes the Issue]
app.put('/todos/:id', async (req, res) => {
    try {
        const { title, description, alert } = req.body;

        // Validate alert structure
        if (alert && (!alert.date || !alert.time || !alert.phone)) {
            return res.status(400).json({ message: "Alert must have date, time, and phone." });
        }

        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            { title, description, alert },
            { new: true, useFindAndModify: false }
        );

        if (!updatedTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.json(updatedTodo);
    } catch (error) {
        console.error('❌ Error updating todo:', error);
        res.status(500).json({ message: error.message });
    }
});

// ✅ Delete a Todo (DELETE)
app.delete('/todos/:id', async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        res.status(204).end();
    } catch (error) {
        console.error('❌ Error deleting todo:', error);
        res.status(500).json({ message: error.message });
    }
});

// ✅ Fetch latest data after update
app.get('/refresh-todos', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (error) {
        console.error('❌ Error fetching updated todos:', error);
        res.status(500).json({ message: error.message });
    }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port: ${PORT}`);
});
