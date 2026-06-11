import { useEffect, useState } from "react";
import axios from "axios";

const API =
  process.env.REACT_APP_API ||
  "/api";

function App() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");

  const loadNotes = async () => {
    const res = await axios.get(`${API}/notes`);
    setNotes(res.data);
  };

  const addNote = async () => {
    if (!text) return;

    await axios.post(`${API}/notes`, {
      text
    });

    setText("");
    loadNotes();
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <div
      style={{
        width: "500px",
        margin: "40px auto",
        fontFamily: "Arial"
      }}
    >
      <h1>DevOps Notes</h1>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="New Note"
      />

      <button onClick={addNote}>
        Add
      </button>

      <ul>
        {notes.map((n) => (
          <li key={n._id}>
            {n.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;