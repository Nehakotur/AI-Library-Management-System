import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axiosInstance from "../api/axiosInstance";

const COLORS = ["#16302C", "#C9974C", "#6B8F71", "#A97D36", "#3F6E52", "#8A887E"];

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, categoryRes, popularBooksRes] = await Promise.all([
          axiosInstance.get("/dashboard"),
          axiosInstance.get("/dashboard/category-stats"),
          axiosInstance.get("/dashboard/popular-books"),
        ]);

        setStats(statsRes.data.data);
        setCategoryData(categoryRes.data.data);
        setPopularBooks(popularBooksRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const socket = io("http://localhost:5000");
    socket.on("bookUpdated", () => fetchData());

    return () => socket.disconnect();
  }, []);

  if (loading) return <div style={{ padding: "48px" }}>Loading...</div>;
  if (error) return <div style={{ padding: "48px", color: "#B5473A" }}>{error}</div>;

  const cards = [
    { label: "Total Books", value: stats.totalBooks },
    { label: "Available Copies", value: stats.totalAvailableCopies },
    { label: "Issued Books", value: stats.totalIssuedBooks },
    { label: "Fine Collected", value: "Rs " + stats.totalFineCollected },
    { label: "Total Users", value: stats.totalUsers },
  ];

  const panelStyle = {
    backgroundColor: "#FBF8F1",
    border: "1px solid #E4DFD2",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(22, 48, 44, 0.05)",
  };

  const statCardStyle = {
    ...panelStyle,
    borderTop: "3px solid #C9974C",
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: "1300px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "28px" }}>Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "18px",
          marginBottom: "32px",
        }}
      >
        {cards.map((card) => (
          <div key={card.label} style={statCardStyle}>
            <p className="text-mono" style={{ fontSize: "0.7rem", color: "#6B6A63", textTransform: "uppercase", marginBottom: "8px" }}>
              {card.label}
            </p>
            <p style={{ fontSize: "1.8rem", fontFamily: "Fraunces, serif", fontWeight: "600", color: "#16302C" }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "20px" }}>
        <div style={panelStyle}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Books by Category</h3>
          {categoryData.length === 0 ? (
            <p style={{ color: "#6B6A63" }}>No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={(entry) => entry.category + ": " + entry.count}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={panelStyle}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Most Popular Books</h3>
          {popularBooks.length === 0 ? (
            <p style={{ color: "#6B6A63" }}>No data available</p>
          ) : (
            <div>
              {popularBooks.map((book, index) => (
                <div
                  key={book._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: index !== popularBooks.length - 1 ? "1px solid #E4DFD2" : "none",
                  }}
                >
                  {book.coverImageUrl && (
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      style={{ width: "34px", height: "48px", objectFit: "cover", borderRadius: "3px", marginRight: "12px" }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.9rem", fontWeight: "500" }}>{book.title}</p>
                    <p style={{ fontSize: "0.78rem", color: "#6B6A63" }}>{book.author}</p>
                  </div>
                  <span
                    className="text-mono"
                    style={{
                      fontSize: "0.7rem",
                      backgroundColor: "#16302C",
                      color: "#C9974C",
                      padding: "3px 9px",
                      borderRadius: "20px",
                    }}
                  >
                    {book.issueCount} issues
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;