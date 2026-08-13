import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Books from "./pages/Books";
import MyIssues from "./pages/MyIssues";
import Dashboard from "./pages/Dashboard";
import OverdueBooks from "./pages/OverdueBooks";
import Chatbot from "./pages/Chatbot";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import QRScanner from "./pages/QRScanner";
import AddBook from "./pages/AddBook";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Newspapers from "./pages/Newspapers";
import BookDetail from "./pages/BookDetail";
import BarcodeScanner from "./pages/BarcodeScanner";

function App() {
  const location = useLocation();
  const authPages = ["/login", "/register", "/forgot-password", "/reset-password"];
  const isAuthPage = authPages.includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Navbar />}

      <div style={{ marginLeft: isAuthPage ? "0" : "240px" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
          <Route path="/books/:id" element={<ProtectedRoute><BookDetail /></ProtectedRoute>} />
          <Route path="/my-issues" element={<ProtectedRoute><MyIssues /></ProtectedRoute>} />
          <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
          <Route path="/newspapers" element={<ProtectedRoute><Newspapers /></ProtectedRoute>} />
          <Route path="/scan" element={<ProtectedRoute><QRScanner /></ProtectedRoute>} />
          <Route path="/scan-barcode" element={<ProtectedRoute><BarcodeScanner /></ProtectedRoute>} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["librarian", "admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/overdue"
            element={
              <ProtectedRoute allowedRoles={["librarian", "admin"]}>
                <OverdueBooks />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-book"
            element={
              <ProtectedRoute allowedRoles={["librarian", "admin"]}>
                <AddBook />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;