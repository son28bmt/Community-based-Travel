const OpenAI = require("openai");

class AiService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "dummy-key",
    });
  }

  async analyzeQuery(query) {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY is not set. Returning null.");
      return null;
    }

    try {
      const prompt = `
      Analyze the following search query for a Vietnam Travel application.
      Extract the following information in JSON format:
      - province: The location/city/province mentioned (e.g., "Đà Nẵng", "Hà Nội", "Đà Lạt").
      - category: The category of place (e.g., "Ăn uống", "Lưu trú", "Tham quan", "Vui chơi").
      - keywords: The main text to search for (excluding location and category words).
      - features: Array of specific attributes (e.g., "view đẹp", "giá rẻ").
      
      Query: "${query}"
      
      Return ONLY the JSON object.
      `;

      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that extracts structured search parameters from natural language queries for a travel app.",
          },
          { role: "user", content: prompt },
        ],
        model: "gpt-3.5-turbo",
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error("OpenAI API Error:", error);
      return null;
    }
  }
}

module.exports = new AiService();
