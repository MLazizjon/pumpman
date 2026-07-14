import { Link, useNavigate } from "react-router-dom";

function Navbar() {

  const navigate = useNavigate();

  const logout = () => {

    localStorage.removeItem("isLogin");

    navigate("/login");

  };

  return (

    <nav className="navbar">

      <h2>Bonus App</h2>

      <div>

        <Link to="/home">
          Home
        </Link>

        <Link to="/settings">
          Settings
        </Link>

        <button onClick={logout}>
          Logout
        </button>

      </div>

    </nav>

  );

}

export default Navbar;