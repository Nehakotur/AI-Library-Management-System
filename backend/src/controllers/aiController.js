const Anthropic = require("@anthropic-ai/sdk");
const Book = require("../models/Book");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// AI Chatbot - Book Recommendation
const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Please provide a message",
      });
    }

    // Database se saari books lao (AI ko context dene ke liye)
    const books = await Book.find().select("title author category quantity available");

    // Books ki list ek text mein convert karo
    const booksListText = books
      .map((b) => `- "${b.title}" by ${b.author} (${b.category}), ${b.available ? "Available" : "Not Available"}`)
      .join("\n");

    // Claude API ko call karo
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Tum ek library assistant ho. Neeche di gayi books ki list ke hisaab se user ke sawal ka jawab do. Sirf isi list mein se books suggest karo, bahar se mat banao.

Books ki list:
${booksListText}

User ka sawal: ${message}`,
        },
      ],
    });

    const aiReply = response.content[0].text;

    res.status(200).json({
      success: true,
      reply: aiReply,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { chatWithAI };