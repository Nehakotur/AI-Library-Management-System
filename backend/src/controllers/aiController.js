const Anthropic = require("@anthropic-ai/sdk");
const Book = require("../models/Book");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Please provide a message",
      });
    }

    // Step 1 (Retrieval): Saari books lao, lekin agar bahut zyada hain to sirf relevant lao
    const allBooks = await Book.find().select(
      "title author category summary moods quantity available"
    );

    let contextBooks = allBooks;

    // Agar 30 se zyada books hain, to pehle AI se filter karwao (RAG step)
    if (allBooks.length > 30) {
      const indexedList = allBooks
        .map((b, i) => `${i}. "${b.title}" - ${b.category} - ${b.summary || ""}`)
        .join("\n");

      const filterResponse = await anthropic.messages.create({
        model: "claude-sonnet-5",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: `Neeche books ki list hai. User ke message ke hisaab se sabse relevant 8 books ke numbers do, comma separated, kuch aur text mat likho.\n\nBooks:\n${indexedList}\n\nUser message: "${message}"`,
          },
        ],
      });

      const indices = filterResponse.content[0].text
        .trim()
        .split(",")
        .map((n) => parseInt(n.trim()))
        .filter((n) => !isNaN(n) && n >= 0 && n < allBooks.length);

      contextBooks = indices.map((i) => allBooks[i]);
    }

    // Step 2 (Generation): Sirf relevant books ke saath jawab banao
    const booksListText = contextBooks
      .map(
        (b) =>
          `- "${b.title}" by ${b.author} (${b.category}), ${b.available ? "Available" : "Not Available"}${b.summary ? " - " + b.summary : ""}`
      )
      .join("\n");

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

// Semantic Search - meaning se books dhoondo
const semanticSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Please provide a search query",
      });
    }

    // Database se saari books lao (ID bhi chahiye is baar)
    const books = await Book.find().select(
      "title author category summary moods coverImageUrl available quantity"
    );

    const booksListText = books
      .map(
        (b, i) =>
          `${i}. "${b.title}" by ${b.author} | Category: ${b.category} | Moods: ${(b.moods || []).join(", ") || "none"} | Summary: ${b.summary || "no summary"}`
      )
      .join("\n");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Tum ek library search engine ho. Neeche books ki list hai, har book ke aage uska number hai. User ki query padhke, sabse relevant books ke sirf NUMBERS return karo, comma se separate karke, sabse relevant pehle. Sirf numbers do, kuch aur text mat likho. Agar koi bhi book relevant na lage to khaali response do.

Books:
${booksListText}

User ki query: "${query}"`,
        },
      ],
    });

    const numbersText = response.content[0].text.trim();
    const indices = numbersText
      .split(",")
      .map((n) => parseInt(n.trim()))
      .filter((n) => !isNaN(n) && n >= 0 && n < books.length);

    const results = indices.map((i) => books[i]);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { chatWithAI, semanticSearch };