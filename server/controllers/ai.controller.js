// axios lets us call OpenRouter's API directly over HTTP
const axios = require("axios");

// Package model — once the AI tells us what to search for, we run a normal query
const Package = require("../models/package.model");

// Handles POST /api/ai/search — turns a natural-language query into
// structured filters using an LLM (via OpenRouter), then searches packages
const aiSearch = async (req, res) => {
  try {
    const userQuery = req.body.query;

    // We'll fill this in if the AI call succeeds. If it stays null,
    // that's our signal to fall back to a plain keyword search below
    let filters = null;

    const prompt = `Extract search filters from this travel query as JSON only, no other text.
Query: "${userQuery}"
Respond with exactly this shape: {"destination": string or null, "maxPrice": number or null, "tags": array of strings}
Valid tags to choose from: beach, budget, culture, adventure, hiking, luxury, relaxation, honeymoon, city, romantic.
Only include tags that clearly match the query's intent. If nothing matches a field, use null (or an empty array for tags).`;

    // This inner try/catch wraps ONLY the AI call. If OpenRouter is
    // rate-limited, down, or returns bad JSON, we catch it here instead
    // of letting it crash the whole request — filters just stays null
    try {
      const aiResponse = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "dots-studio/dots-3-note-preview:free",
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },
        },
      );

      const rawText = aiResponse.data.choices[0].message.content;
      const cleanedText = rawText.replace(/```json|```/g, "").trim();
      filters = JSON.parse(cleanedText);
    } catch (aiError) {
      // Log the real reason for debugging, but don't rethrow —
      // we want to fall back gracefully, not fail the request
      console.log(
        "AI search unavailable, falling back to keyword search:",
        aiError.response?.data || aiError.message,
      );
    }

    let packages;
    let interpretedFilters;

    if (filters) {
      // AI succeeded — same structured filter logic as before
      const dbFilter = {};
      if (filters.destination) {
        dbFilter.destination = { $regex: filters.destination, $options: "i" };
      }
      if (filters.maxPrice) {
        dbFilter.price = { $lte: filters.maxPrice };
      }
      if (filters.tags && filters.tags.length > 0) {
        dbFilter.tags = { $in: filters.tags };
      }

      packages = await Package.find(dbFilter).populate(
        "agency",
        "firstName agencyName",
      );
      interpretedFilters = filters;
    } else {
      // AI failed — fall back to a plain keyword search across the
      // fields most likely to contain whatever the user typed. Less
      // "smart" than the AI version, but the search bar keeps working
      // even if OpenRouter is rate-limited or down mid-demo
      const keywordFilter = {
        $or: [
          { title: { $regex: userQuery, $options: "i" } },
          { destination: { $regex: userQuery, $options: "i" } },
          { description: { $regex: userQuery, $options: "i" } },
          { tags: { $regex: userQuery, $options: "i" } },
        ],
      };

      packages = await Package.find(keywordFilter).populate(
        "agency",
        "firstName agencyName",
      );
      // No structured filters to show, but we flag that this was a
      // fallback in case the frontend wants to display it differently
      interpretedFilters = {
        destination: null,
        maxPrice: null,
        tags: [],
        fallback: true,
      };
    }

    return res.json({ packages, interpretedFilters });
  } catch (error) {
    // This outer catch is now only for truly unexpected errors —
    // e.g. Package.find itself throwing (bad DB connection, etc.)
    console.log("AI search error:", error.message);
    return res.status(500).json({ message: "AI search failed" });
  }
};

// Handles POST /api/ai/translate — translates a package description into a
// target language, using the same OpenRouter model as AI search. Unlike
// search, there's no keyword-style fallback for translation — if the AI
// call fails, we return a clear error instead of faking a translation
const translateText = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ message: "text and targetLanguage are required" });
    }

    const prompt = `Translate the following text into ${targetLanguage}. Respond with ONLY the translated text — no quotes, no explanation, nothing else.

Text: "${text}"`;

    const aiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "dots-studio/dots-3-note-preview:free",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
      },
    );

    const translatedText = aiResponse.data.choices[0].message.content.trim();

    return res.json({ translatedText });
  } catch (error) {
    console.log("Translation error:", error.response?.data || error.message);
    return res.status(500).json({ message: "Translation unavailable right now" });
  }
};

module.exports = { aiSearch, translateText };