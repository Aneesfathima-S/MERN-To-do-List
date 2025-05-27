import { useState, useEffect } from "react";
import axios from "axios";

const TodoApp = () => {
    const [todos, setTodos] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedTodoId, setSelectedTodoId] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [phone, setPhone] = useState("");
    const [alertData, setAlertData] = useState({});

    const API_URL = "http://localhost:5000/todos";

    // ✅ Fetch todos only once when component mounts
    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            const response = await axios.get(API_URL);
            setTodos(response.data);
        } catch (err) {
            console.error("Error fetching todos:", err);
        }
    };

    useEffect(() => {
        if (message || error) {
            const timer = setTimeout(() => {
                setMessage("");
                setError("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message, error]);

    const handleSubmit = async () => {
        if (!title.trim()) {
            setError("❌ Please enter a title!");
            return;
        }
        try {
            const response = await axios.post(API_URL, { title, description });
            setTodos([...todos, response.data]); // ✅ Updates list immediately
            setTitle("");
            setDescription("");
            setMessage("✅ Task added successfully!");
        } catch (err) {
            console.error("Error adding task:", err);
            setError("❌ Error adding task!");
        }
    };

    const handleEdit = (todo) => {
        setSelectedTodoId(todo._id);
        setTitle(todo.title);
        setDescription(todo.description);
    };

    const handleSaveEdit = async () => {
        if (!title.trim()) {
            setError("❌ Please enter a title!");
            return;
        }
        try {
            await axios.put(`${API_URL}/${selectedTodoId}`, { title, description });
            fetchTodos(); // ✅ Refresh data after update
            setSelectedTodoId(null);
            setTitle("");
            setDescription("");
            setMessage("✅ Task updated successfully!");
        } catch (err) {
            console.error("Error updating task:", err);
            setError("❌ Error updating task!");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchTodos(); // ✅ Refresh list after delete
            setMessage("🗑️ Task deleted successfully!");
        } catch (err) {
            console.error("Error deleting task:", err);
            setError("❌ Error deleting task!");
        }
    };

    const handleSetAlert = (todoId) => {
        if (!date || !time || !phone) {
            setError("⚠️ Please fill all fields before setting an alert!");
            return;
        }
        setAlertData({ ...alertData, [todoId]: { date, time, phone } });
        setMessage(`✅ Alert set for ${date} at ${time} (Phone: ${phone})`);
        setShowModal(false);
    };

    return (
        <div className="container mt-4">
            <h2>📌 To-Do List</h2>

            {(message || error) && (
                <div className={`alert ${message ? "alert-success" : "alert-danger"}`}>
                    {message || error}
                    <button className="close-btn" onClick={() => { setMessage(""); setError(""); }}>❌</button>
                </div>
            )}

            <div className="mb-3">
                <input type="text" className="form-control mb-2" placeholder="Title"
                    value={title} onChange={(e) => setTitle(e.target.value)}
                />
                <input type="text" className="form-control mb-2" placeholder="Description"
                    value={description} onChange={(e) => setDescription(e.target.value)}
                />
                <button className="btn btn-success me-2" onClick={selectedTodoId ? handleSaveEdit : handleSubmit}>
                    {selectedTodoId ? "Save Changes" : "Add Task"}
                </button>
            </div>

            <ul className="list-group">
                {todos.map((item) => (
                    <li key={item._id} className="list-group-item d-flex justify-content-between align-items-center my-2">
                        <div>
                            <span className="fw-bold">{item.title}</span>
                            <span> - {item.description}</span>
                            {alertData[item._id] && (
                                <p className="text-warning">
                                    📅 {alertData[item._id].date} 🕒 {alertData[item._id].time} 📞 {alertData[item._id].phone}
                                </p>
                            )}
                        </div>
                        <div>
                            <button className="btn btn-primary me-2" onClick={() => handleEdit(item)}>Edit</button>
                            <button className="btn btn-danger me-2" onClick={() => handleDelete(item._id)}>Delete</button>
                            <button className="btn btn-warning" onClick={() => setShowModal(item._id)}>Alert</button>
                        </div>
                    </li>
                ))}
            </ul>

            {showModal && (
                <div className="modal d-flex align-items-center justify-content-center" style={{ display: "block" }}>
                    <div className="modal-content p-4" style={{ width: "300px", height: "300px", borderRadius: "10px", backgroundColor: "#fff", boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }}>
                        <h4 className="text-center mb-3">Set Alert</h4>
                        <input type="date" className="form-control mb-2" value={date} onChange={(e) => setDate(e.target.value)} />
                        <input type="time" className="form-control mb-2" value={time} onChange={(e) => setTime(e.target.value)} />
                        <input type="tel" className="form-control mb-3" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        <div className="d-flex justify-content-between">
                            <button className="btn btn-primary" onClick={() => handleSetAlert(showModal)}>Set Alert</button>
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TodoApp;
