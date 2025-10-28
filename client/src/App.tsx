import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [serverStatus, setServerStatus] = useState("Connecting...");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/health")
      .then((res) => setServerStatus(res.data.message))
      .catch(() => setServerStatus("❌ Backend not reachable"));
  }, []);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <h1 className="display-5 fw-bold text-primary mb-3">
        🎓 Online Learning Platform
      </h1>
      <p className="lead text-secondary">{serverStatus}</p>
      <button className="btn btn-outline-primary mt-3">Get Started</button>
    </div>
  );
}

export default App;
