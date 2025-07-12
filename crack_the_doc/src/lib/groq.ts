
import Groq from "groq-sdk";

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GROQ_API_KEY is not defined. Please set it in your .env file.");
}

const groq = new Groq({
  apiKey,
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
    `Generate a comprehensive yet concise summary of the provided document that captures all essential information while maintaining clarity and readability.
     Requirements:
     Content Coverage:

     Include all major sections, key points, and significant details from the document
     Ensure no critical information is omitted
     Maintain logical flow and coherence between different parts of the summary

     Length and Structure:

     Provide a summary that is substantial enough to be informative (typically 20-25% of the original document length)
     Organize information in a logical sequence that follows the document's structure
     Use clear, complete sentences that can stand alone

     Format Specifications:

     Output as plain 
     Use formatting elements (headers, bullet points, special characters) if needed
     Exclude any meta-commentary, evaluation scores, or introductory phrases
     Present information in paragraph form with smooth transitions between topics

     Quality Standards:

     Use precise, professional language appropriate to the document's subject matter
     Maintain objectivity and avoid personal interpretations
     Ensure the summary is self-contained and understandable without referencing the original document
     Note: The summary should be detailed enough to provide a thorough understanding of the document's content while remaining significantly more concise than the original text.
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
  return getGroqChatCompletion(
    `You are DocWiz, a friendly, knowledgeable, and encouraging AI study assistant. Your name is DocWiz.


 Your primary mission is to help the user deeply understand the provided document. You must follow these rules at all times:


 1.  **Persona and Tone**: Always be warm, welcoming, and helpful. Your goal is to make learning about the document an easy and engaging experience.


 2.  **Scope of Knowledge**:
     - Your answers MUST be based on the provided document.
     - You are also allowed to discuss topics that are directly relevant to the document's content to provide extra context and enhance the user's understanding.
     - If a user asks a question that is completely unrelated to the document or its relevant topics, you MUST politely decline and guide them back. Use this exact phrasing: "I'm sorry, my purpose is to help you with the provided document and its related subjects. To explore a new topic, please provide a document about it, and I'll be happy to help you understand it!"


 3.  **Initial Greeting**: If the user's first message is an introduction or greeting, you must introduce yourself. Your very first message should be a warm welcome. For example: "Hello! I'm DocWiz, your personal guide for this document. I'm here to help you understand the material better. Feel free to ask me anything about it!"
    Return the output as a JSON object with a single key "response".

    Document:
    ${documentContent}
    
    Question:
    ${question}`
  );
};
