const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class GeminiService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }

    async analyzeData(dataText, question) {
        try {
            const prompt = `
            You are a data analyst. Analyze the following JSON sales data and answer the question.
            
            Data: ${dataText}
            
            
            Use this data to answer the question below.

            Question: ${question}

            Rules:
            - Use only the information in the JSON data.
            - Do not guess or invent any values.
            - Do NOT return JSON. Answer in plain text only.
            - If the question involves revenue, calculate it as Price multiplied by Quantity.
            - If grouping by month, extract the month from OrderDate in format YYYY-MM.
            - Do not include headers or descriptions.
            - If the data is not enough to answer, respond with: Insufficient data.
            - Include key numbers or intermediate steps where relevant.
            `;

            const result = await this.model.generateContent( prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error analyzing data:', error);
            throw new Error('Không thể phân tích dữ liệu');
        }
    }

    async generateInsights(data) {
        try {
            const prompt = `
            Phân tích dữ liệu sau và đưa ra những insights quan trọng:
            ${JSON.stringify(data, null, 2)}
            
            Hãy tìm ra:
            1. Xu hướng chính
            2. Điểm bất thường
            3. Cơ hội cải thiện
            4. Dự đoán
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error generating insights:', error);
            throw new Error('Không thể tạo insights');
        }
    }
}

module.exports = GeminiService;