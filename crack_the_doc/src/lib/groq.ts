
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const getGroqChatCompletion = (content: string) => {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content,
      },
    ],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  });
};

export const getSummary = (content: string) => {
  return getGroqChatCompletion(
    `Generate a concise, well-organized summary of the following document. The summary should be plain text, without any additional titles, headers, or evaluation scores.
    Return the output as a JSON object with a single key "summary".
    
    Document:
    ${content}`
  );
};

export const getKeyPoints = (content: string) => {
  return getGroqChatCompletion(
    `Extract the key points from the following document. For each key point, provide a headline and a detailed definition or explanation.
    Return the output as a JSON object with a single key "key_points", which should be an array of objects. Each object in the array should have two keys: "point" (the headline) and "definition".
    Ensure there are no empty entries.

    Example format:
    {
      "key_points": [
        { "point": "Key Point Headline 1", "definition": "Detailed definition for key point 1." },
        { "point": "Key Point Headline 2", "definition": "Detailed definition for key point 2." }
      ]
    }
    
    Document:
    ${content}`
  );
};

export const getQuestions = (content: string) => {
  return getGroqChatCompletion(
    `Generate a list of questions and answers based on the following document.
    Return the output as a JSON object with a single key "questions", which should be an array of objects. Each object in the array should have two keys: "question" and "answer".
    Ensure there are no empty entries.

    Example format:
    {
      "questions": [
        { "question": "What is the primary topic?", "answer": "The primary topic is..." },
        { "question": "How is the technology described?", "answer": "The technology is described as..." }
      ]
    }

    Document:
    ${content}`
  );
};

export const getChatbotResponse = (documentContent: string, question: string) => {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Based on the following document, answer the user's question.

        Document:
        ${documentContent}
        
        Question:
        ${question}`,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
};
