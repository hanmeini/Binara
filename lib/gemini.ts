import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const MODEL_NAME = "gemini-2.5-flash";

export async function generateCaption(prompt: string, imageBase64?: string) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      let result;
      if (imageBase64) {
        // Need to strip the header (e.g., "data:image/jpeg;base64,") for the API if it exists,
        // but GenerativeAI SDK usually expects the base64 string directly or with inline data part.
        // Let's standardise on passing the raw base64 data portion + mimeType.
        
        // Basic parsing if full data URI is passed
        const mimeType = imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || "image/jpeg";
        const base64Data = imageBase64.split(",")[1] || imageBase64;

        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        };

        result = await model.generateContent([prompt, imagePart]);
      } else {
        result = await model.generateContent(prompt);
      }

      const response = await result.response;
      return response.text();
    } catch (error: any) {
      if (error?.status === 429 && retryCount < maxRetries - 1) {
        console.warn(`Gemini API rate limited. Retrying (${retryCount + 1}/${maxRetries})...`);
        retryCount++;
        // Wait before retrying (exponential backoff: 1s, 2s, 4s)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        continue;
      }
      
      console.error("Gemini API Error:", error);
      throw new Error(`Failed to generate caption with Gemini: ${error.message}`);
    }
  }
}

export async function generateDashboardData(month: string = "Januari", year: string = "2026") {
  // Check cache first (1 hour expiry)
  const cacheKey = `dashboard_data_${month}_${year}`;
  const cacheExpiryKey = `${cacheKey}_expiry`;
  
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(cacheKey);
    const expiry = localStorage.getItem(cacheExpiryKey);
    
    if (cached && expiry) {
      const isExpired = Date.now() > parseInt(expiry);
      if (!isExpired) {
        console.log("Using cached dashboard data");
        return JSON.parse(cached);
      }
    }
  }

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `
    Generate a JSON object for a design dashboard for the month of ${month} ${year}.
    The response must be a valid JSON object without any markdown formatting or code blocks.
    
    Structure:
    {
      "stats": {
        "views": "1.245", // string with thousand separator, vary based on month
        "sales": "156", // string
        "orders": "56", // string
        "trend": 12 // number, percentage increase
      },
      "trend": {
        "year": "${year}",
        "description": "Trend desain untuk bulan ${month}",
        "data": [10, 25, 15, 30, 45, 35, 50, 40, 60, 55, 70, 65, 80] // Array of 13 numbers (0-100) representing curve for ${month}
      }
    }
    
    Make the numbers and chart curve valid and slightly different than a generic dataset to feel dynamic for ${month}.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown code block syntax if Gemini adds it
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(jsonString);
    
    // Cache the data (1 hour = 3600000ms)
    if (typeof window !== "undefined") {
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(cacheExpiryKey, (Date.now() + 3600000).toString());
      console.log("Dashboard data cached successfully");
    }
    
    return data;
  } catch (error: any) {
    console.error("Failed to generate dashboard data:", error);
    
    // Try to use expired cache as last resort
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        console.log("Using expired cache due to API error");
        return JSON.parse(cached);
      }
    }
    
    // Fallback data with quota warning
    console.warn("⚠️ Using fallback data - Gemini API quota may be exceeded");
    return {
      stats: {
        views: "1.245",
        sales: "156",
        orders: "56",
        trend: 12
      },
      trend: {
        year: "2026",
        description: "Mengikuti perubahan kebutuhan dan selera desain",
        data: [10, 25, 40, 30, 45, 35, 50, 40, 60, 55, 70, 65, 80]
      }
    };
  }
}

export async function getChatResponse(history: { role: "user" | "model"; parts: string }[], message: string) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  
  const chat = model.startChat({
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.parts }],
    })),
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });

  try {
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw new Error("Maaf, Arsa sedang sibuk. Coba lagi nanti ya!");
  }
}
