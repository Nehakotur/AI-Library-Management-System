import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axiosInstance from "../api/axiosInstance";

const COLORS = ["#0d6efd", "#198754", "#ffc107", "#dc3545", "#6f42c1", "#20c997"];

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, categoryRes] = await Promise.all([
          axiosInstance.get("/dashboard"),
          axiosInstance.get("/dashboard/category-stats"),
        ]);

        setStats(statsRes.data.data);
        setCategoryData(categoryRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.log("❌ Socket connection error:", err.message);
   });

    socket.on("bookUpdated", () => {
      console.log("📢 Book updated! Refreshing dashboard...");
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;

  const cards = [
    { label: "Total Books", value: stats.totalBooks, color: "primary" },
    { label: "Available Copies", value: stats.totalAvailableCopies, color: "success" },
    { label: "Issued Books", value: stats.totalIssuedBooks, color: "warning" },
    { label: "Fine Collected", value: `₹${stats.totalFineCollected}`, color: "danger" },
    { label: "Total Users", value: stats.totalUsers, color: "info" },
  ];

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Dashboard</h2>

      <div className="row">
        {cards.map((card) => (
          <div className="col-md-4 mb-4" key={card.label}>
            <div className={`card text-white bg-${card.color} h-100`}>
              <div className="card-body text-center">
                <h6 className="card-title">{card.label}</h6>
                <h2>{card.value}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-3">
        <div className="card-body">
          <h5 className="card-title mb-4">Books by Category</h5>

          {categoryData.length === 0 ? (
            <p>No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.category}: ${entry.count}`}
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
      </div>
    </div>
  );
}

export default Dashboard;