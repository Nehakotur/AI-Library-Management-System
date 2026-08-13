import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    borderRadius: "8px",
    color: isActive(path) ? "#16302C" : "#E4DFD2",
    backgroundColor: isActive(path) ? "#C9974C" : "transparent",
    textDecoration: "none",
    fontWeight: isActive(path) ? "600" : "400",
    marginBottom: "4px",
    fontSize: "0.95rem",
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "240px",
        height: "100vh",
        backgroundColor: "#16302C",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      <Link
        to="/books"
        style={{
          fontFamily: "Fraunces, serif",
          fontSize: "1.4rem",
          fontWeight: "600",
          color: "#F5F3ED",
          textDecoration: "none",
          marginBottom: "32px",
          display: "block",
        }}
      >
        The Library
      </Link>

      <nav style={{ flex: 1 }}>
        <Link to="/books" style={linkStyle("/books")}>
          Books
        </Link>
        <Link to="/scan" style={linkStyle("/scan")}>
          Scan QR
        </Link>
        <Link to="/scan-barcode" style={linkStyle("/scan-barcode")}>
          Scan Barcode
        </Link>
        <Link to="/my-issues" style={linkStyle("/my-issues")}>
          My Issues
        </Link>
        <Link to="/newspapers" style={linkStyle("/newspapers")}>
          Newspapers
        </Link>
        <Link to="/chatbot" style={linkStyle("/chatbot")}>
          Chatbot
        </Link>

        {(user?.role === "librarian" || user?.role === "admin") && (
          <>
            <div
              style={{
                borderTop: "1px solid #24463F",
                margin: "16px 0",
              }}
            ></div>
            <Link to="/dashboard" style={linkStyle("/dashboard")}>
              Dashboard
            </Link>
            <Link to="/overdue" style={linkStyle("/overdue")}>
              Overdue
            </Link>
            <Link to="/add-book" style={linkStyle("/add-book")}>
              Add Book
            </Link>
          </>
        )}
      </nav>

      <div
        style={{
          borderTop: "1px solid #24463F",
          paddingTop: "16px",
          marginTop: "16px",
        }}
      >
        <div style={{ color: "#F5F3ED", fontSize: "0.85rem", marginBottom: "8px" }}>
          {user?.name} <span style={{ color: "#C9974C" }}>({user?.role})</span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "8px",
            backgroundColor: "transparent",
            border: "1px solid #C9974C",
            color: "#C9974C",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;