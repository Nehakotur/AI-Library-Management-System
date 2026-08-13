import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchBook = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/books/" + id);
      setBook(response.data.data);
      setRelatedBooks(response.data.relatedBooks || []);
    } catch (err) {
      setMessage("Failed to load book");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  const handleIssue = async () => {
    setMessage("");
    try {
      await axiosInstance.post("/issues/issue", { bookId: book._id });
      setMessage("Book issued successfully!");
      fetchBook();
    } catch (err) {
      setMessage(err.response?.data?.message || "Issue failed");
    }
  };

  const handleRate = async (rating) => {
    setMessage("");
    try {
      await axiosInstance.post("/reviews/" + book._id, { rating });
      setMessage("Thanks for rating!");
      fetchBook();
    } catch (err) {
      setMessage(err.response?.data?.message || "Rating failed");
    }
  };

  const handleBuyAccess = async () => {
    setMessage("");
    try {
      const orderRes = await axiosInstance.post("/payments/create-order", { bookId: book._id });
      const orderId = orderRes.data.orderId;

      const confirmed = window.confirm(
        "Pay Rs " + orderRes.data.amount + " for " + orderRes.data.bookTitle + "? (Demo payment)"
      );

      if (!confirmed) return;

      const verifyRes = await axiosInstance.post("/payments/verify", { orderId });
      setMessage(verifyRes.data.message);
      window.open(verifyRes.data.pdfUrl, "_blank");
    } catch (err) {
      setMessage(err.response?.data?.message || "Payment failed");
    }
  };

  if (loading) return <div style={{ padding: "48px" }}>Loading...</div>;
  if (!book) return <div style={{ padding: "48px" }}>Book not found</div>;

  return (
    <div style={{ padding: "40px 48px", maxWidth: "1100px" }}>
      {message && (
        <div style={{ padding: "12px 16px", backgroundColor: "#FFF8EC", border: "1px solid #C9974C", borderRadius: "8px", marginBottom: "24px", color: "#16302C" }}>
          {message}
        </div>
      )}

      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        <div style={{ width: "220px", flexShrink: 0 }}>
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={book.title}
              style={{
                width: "100%",
                aspectRatio: "2 / 3",
                objectFit: "cover",
                borderRadius: "4px",
                boxShadow: "0 12px 24px rgba(22, 48, 44, 0.22)",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                aspectRatio: "2 / 3",
                backgroundColor: "#16302C",
                borderRadius: "4px",
                boxShadow: "0 12px 24px rgba(22, 48, 44, 0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#C9974C",
                fontFamily: "Fraunces, serif",
                padding: "16px",
                textAlign: "center",
              }}
            >
              {book.title}
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: "280px" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "4px" }}>{book.title}</h1>
          <p style={{ color: "#6B6A63", fontSize: "1.05rem", marginBottom: "16px" }}>
            by {book.author}
          </p>

          <div style={{ marginBottom: "10px" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => handleRate(star)}
                style={{ cursor: "pointer", fontSize: "1.3rem", color: "#C9974C" }}
                title={"Rate " + star + " stars"}
              >
                {star <= Math.round(book.averageRating || 0) ? "★" : "☆"}
              </span>
            ))}
            <span className="text-mono" style={{ fontSize: "0.85rem", color: "#6B6A63", marginLeft: "8px" }}>
              {book.averageRating || 0} ({book.numReviews || 0} reviews)
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            <span
              className="text-mono"
              style={{
                fontSize: "0.75rem",
                backgroundColor: "#F5F3ED",
                border: "1px solid #E4DFD2",
                padding: "4px 10px",
                borderRadius: "20px",
                color: "#6B6A63",
              }}
            >
              {book.category}
            </span>
            {book.moods && book.moods.map((mood) => (
              <span
                key={mood}
                className="text-mono"
                style={{
                  fontSize: "0.75rem",
                  backgroundColor: "#F5F3ED",
                  border: "1px solid #E4DFD2",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  color: "#A97D36",
                }}
              >
                {mood}
              </span>
            ))}
          </div>

          <div
            className="text-mono"
            style={{
              fontSize: "0.8rem",
              color: book.available ? "#3F6E52" : "#B5473A",
              marginBottom: "24px",
            }}
          >
            {book.available ? "AVAILABLE · " + book.quantity + " COPIES" : "UNAVAILABLE"}
          </div>

          {book.summary && (
            <div style={{ marginBottom: "28px" }}>
              <h4 style={{ fontSize: "1rem", marginBottom: "8px" }}>About this book</h4>
              <p style={{ color: "#4A4A45", lineHeight: "1.7", fontSize: "0.95rem" }}>
                {book.summary}
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              disabled={!book.available}
              onClick={handleIssue}
              style={{
                padding: "10px 24px",
                backgroundColor: book.available ? "#16302C" : "#CFCBBB",
                color: book.available ? "#F5F3ED" : "#8A887E",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: book.available ? "pointer" : "not-allowed",
              }}
            >
              Issue Book
            </button>

            {book.pdfUrl && book.isFree && (
              <a
                href={book.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "10px 24px",
                  border: "1px solid #16302C",
                  color: "#16302C",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Read PDF (Free)
              </a>
            )}

            {book.pdfUrl && !book.isFree && (
              <button
                onClick={handleBuyAccess}
                style={{
                  padding: "10px 24px",
                  border: "1px solid #C9974C",
                  backgroundColor: "transparent",
                  color: "#A97D36",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Buy PDF Access (Rs {book.price})
              </button>
            )}
          </div>

          {book.audioUrl && (
            <div style={{ marginTop: "20px" }}>
              <p className="text-mono" style={{ fontSize: "0.75rem", color: "#6B6A63", marginBottom: "6px" }}>
                AUDIOBOOK
              </p>
              <audio controls style={{ width: "100%" }}>
                <source src={book.audioUrl} />
                Your browser does not support audio playback.
              </audio>
            </div>
          )}

          {book.barcodeUrl && (
            <div style={{ marginTop: "24px" }}>
              <p className="text-mono" style={{ fontSize: "0.75rem", color: "#6B6A63", marginBottom: "6px" }}>
                BARCODE (ISBN)
              </p>
              <img
                src={book.barcodeUrl}
                alt="Barcode"
                style={{ maxWidth: "220px", backgroundColor: "#FFFFFF", padding: "8px", borderRadius: "4px", border: "1px solid #E4DFD2" }}
               />
            </div>
         )}
        </div>
      </div>

      {relatedBooks.length > 0 && (
        <div style={{ marginTop: "56px" }}>
          <h3 style={{ fontSize: "1.3rem", marginBottom: "20px" }}>You might also like</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "24px",
              maxWidth: "760px",
            }}
          >
            {relatedBooks.map((rb) => (
              <Link
                to={"/books/" + rb._id}
                key={rb._id}
                style={{ textDecoration: "none" }}
              >
                {rb.coverImageUrl ? (
                  <img
                    src={rb.coverImageUrl}
                    alt={rb.title}
                    className="book-cover"
                    style={{
                      width: "100%",
                      aspectRatio: "2 / 3",
                      objectFit: "cover",
                      borderRadius: "4px",
                      boxShadow: "0 6px 12px rgba(22, 48, 44, 0.15)",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    className="book-cover"
                    style={{
                      width: "100%",
                      aspectRatio: "2 / 3",
                      backgroundColor: "#16302C",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#C9974C",
                      fontFamily: "Fraunces, serif",
                      fontSize: "0.85rem",
                      padding: "10px",
                      textAlign: "center",
                    }}
                  >
                    {rb.title}
                  </div>
                )}
                <p style={{ fontSize: "0.85rem", color: "#1E2420", marginTop: "8px" }}>
                  {rb.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BookDetail;