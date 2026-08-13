const Book = require("../models/Book");
const QRCode = require("qrcode");
const cloudinary = require("../config/cloudinary");
const bwipjs = require("bwip-js");

// Add Book
const addBook = async (req, res) => {
  try {
    const bookData = { ...req.body };

    // Moods ko comma-separated text se array mein convert karo
    if (bookData.moods && typeof bookData.moods === "string") {
      bookData.moods = bookData.moods.split(",").map((m) => m.trim()).filter(Boolean);
    }
    const book = await Book.create(bookData);

    // QR Code generate karo (book ki _id encode karke)
    const qrCodeDataUrl = await QRCode.toDataURL(book._id.toString());
    book.qrCodeUrl = qrCodeDataUrl;

    // Barcode generate karo (ISBN encode karke)
try {
  const barcodeBuffer = await bwipjs.toBuffer({
    bcid: "code128",
    text: book.isbn,
    scale: 3,
    height: 12,
    includetext: true,
    textxalign: "center",
  });

  book.barcodeUrl = "data:image/png;base64," + barcodeBuffer.toString("base64");
} catch (barcodeError) {
  console.error("Barcode generation failed:", barcodeError.message);
}

    // Agar cover image upload hui hai, Cloudinary pe daalo
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "library-books" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      book.coverImageUrl = uploadResult.secure_url;
    }// Agar cover image upload hui hai, Cloudinary pe daalo
if (req.files?.coverImage) {
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "library-books" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(req.files.coverImage[0].buffer);
  });

  book.coverImageUrl = uploadResult.secure_url;
}

// Agar PDF upload hui hai, Cloudinary pe daalo
if (req.files?.pdf) {
  const pdfUploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "library-pdfs", resource_type: "raw" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(req.files.pdf[0].buffer);
  });

  book.pdfUrl = pdfUploadResult.secure_url;
}

// Agar Audiobook upload hui hai, Cloudinary pe daalo
if (req.files?.audio) {
  const audioUploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "library-audio", resource_type: "video" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(req.files.audio[0].buffer);
  });

  book.audioUrl = audioUploadResult.secure_url;
}

    await book.save();

    res.status(201).json({
      success: true,
      message: "Book Added Successfully",
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Get All Books
const getBooks = async (req, res) => {
  try {
    const { search, category } = req.query;

    let filter = {};

    // Agar search word diya hai, title ya author mein dhoondo
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    // Agar category diya hai, usse filter karo
    if (category) {
      filter.category = category;
    }

    const books = await Book.find(filter);

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get single book
const getSingleBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book Not Found",
      });
    }

    // Related books dhoondo - same category ya same mood wali, is book ko chhodkar
    const relatedBooks = await Book.find({
      _id: { $ne: book._id },
      $or: [
        { category: { $regex: new RegExp("^" + book.category + "$", "i") } },
        { moods: { $in: (book.moods || []).map((m) => new RegExp("^" + m + "$", "i")) } },
      ],
    }).limit(4);

    res.status(200).json({
      success: true,
      data: book,
      relatedBooks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ISBN/Barcode se book dhoondo
const getBookByIsbn = async (req, res) => {
  try {
    const book = await Book.findOne({ isbn: req.params.isbn });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "No book found with this ISBN",
      });
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Book
const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book Updated Successfully",
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Book
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addBook,
  getBooks,
  getSingleBook,
  getBookByIsbn,
  updateBook,
  deleteBook,
};