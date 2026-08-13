import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import axiosInstance from "../api/axiosInstance";

function BarcodeScanner() {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  const startScan = async () => {
    setMessage("");
    setScanning(true);

    const scanner = new Html5Qrcode("barcode-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 280, height: 120 },
          formatsToSupport: [
            0, // CODE_128
            1, // CODE_39
            8, // EAN_13
            9, // EAN_8
            10, // UPC_A
          ],
        },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          lookupBook(decodedText);
        }
      );
    } catch (err) {
      setMessage("Camera access failed: " + err.message);
      setScanning(false);
    }
  };

  const lookupBook = async (isbn) => {
    setMessage("Looking up ISBN " + isbn + "...");
    try {
      const response = await axiosInstance.get("/books/isbn/" + isbn);
      navigate("/books/" + response.data.data._id);
    } catch (err) {
      setMessage(err.response?.data?.message || "No book found for this barcode");
    }
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: "500px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Barcode Scanner</h1>
      <p style={{ color: "#6B6A63", marginBottom: "24px" }}>
        Scan a book's barcode to open its details instantly
      </p>

      {message && (
        <div style={{ padding: "12px 16px", backgroundColor: "#FFF8EC", border: "1px solid #C9974C", borderRadius: "8px", marginBottom: "20px", color: "#16302C" }}>
          {message}
        </div>
      )}

      {!scanning && (
        <button
          onClick={startScan}
          style={{
            padding: "10px 24px",
            backgroundColor: "#16302C",
            color: "#F5F3ED",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          Start Scanning
        </button>
      )}

      <div id="barcode-reader" style={{ width: "100%" }}></div>
    </div>
  );
}

export default BarcodeScanner;