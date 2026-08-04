import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to="/books">
        📚 Library System
      </Link>

      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/books">
              Books
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/scan">
              Scan QR
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/my-issues">
              My Issues
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/chatbot">
              Chatbot
            </Link>
          </li>
          {(user?.role === "librarian" || user?.role === "admin") && (
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                Dashboard
              </Link>
            </li>
            
          )}
          {(user?.role === "librarian" || user?.role === "admin") && (
            <li className="nav-item">
              <Link className="nav-link" to="/overdue">
                Overdue
              </Link>
            </li>
          )}

          {(user?.role === "librarian" || user?.role === "admin") && (
            <li className="nav-item">
              <Link className="nav-link" to="/add-book">
                Add Book
              </Link>
            </li>
         )}
        </ul>

        <div className="d-flex align-items-center">
          <span className="text-white me-3">
            {user?.name} ({user?.role})
          </span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;