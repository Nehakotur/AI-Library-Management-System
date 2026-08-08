const Newspaper = require("../models/Newspaper");

// Add Newspaper (librarian/admin)
const addNewspaper = async (req, res) => {
  try {
    const newspaper = await Newspaper.create(req.body);

    res.status(201).json({
      success: true,
      message: "Newspaper added successfully",
      data: newspaper,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all newspapers (sabke liye - latest pehle)
const getNewspapers = async (req, res) => {
  try {
    const newspapers = await Newspaper.find().sort({ editionDate: -1 });

    res.status(200).json({
      success: true,
      count: newspapers.length,
      data: newspapers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete newspaper (librarian/admin)
const deleteNewspaper = async (req, res) => {
  try {
    const newspaper = await Newspaper.findByIdAndDelete(req.params.id);

    if (!newspaper) {
      return res.status(404).json({
        success: false,
        message: "Newspaper not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Newspaper deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { addNewspaper, getNewspapers, deleteNewspaper };