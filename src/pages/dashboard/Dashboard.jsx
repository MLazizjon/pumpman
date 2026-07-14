import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <h1>📊 Dashboard</h1>

      <div style={styles.card}>
        <h2>Salom, {user?.name} 👋</h2>
        <p>📱 Telefon: {user?.phone}</p>
        <p>⭐ Ball: {user?.score || 0}</p>
      </div>

      <button onClick={handleLogout} style={styles.button}>
        Logout
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    textAlign: "center",
  },
  card: {
    margin: "20px auto",
    padding: "20px",
    width: "300px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  button: {
    padding: "10px 20px",
    background: "red",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default Dashboard;