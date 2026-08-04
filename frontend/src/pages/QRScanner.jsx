import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axiosInstance from "../api/axiosInstance";

function QRScanner() {
  const [scanResult, setScanResult] = useState("");
  const [message, setMessage] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      // Component band hote waqt camera bhi band kar do
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScan = async () => {
    setMessage("");
    setScanResult("");
    setScanning(true);

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          // QR scan hote hi camera band karo
          await scanner.stop();
          setScanning(false);
          setScanResult(decodedText);
        }
      );
    } catch (err) {
      setMessage("Camera access failed: " + err.message);
      setScanning(false);
    }
  };

  const handleIssue = async () => {
    try {
      await axiosInstance.post("/issues/issue", { bookId: scanResult });
      setMessage("Book issued successfully!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Issue failed");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4">QR Code Scanner</h2>

      {message && <div className="alert alert-info">{message}</div>}

      {!scanning && (
        <button className="btn btn-primary mb-3" onClick={startScan}>
          Start Scanning
        </button>
      )}

      <div id="qr-reader" style={{ width: "100%" }}></div>

      {scanResult && (
        <div className="mt-3">
          <p>
            <strong>Scanned Book ID:</strong> {scanResult}
          </p>
          <button className="btn btn-success" onClick={handleIssue}>
            Issue This Book
          </button>
        </div>
      )}
    </div>
  );
}

export default QRScanner;