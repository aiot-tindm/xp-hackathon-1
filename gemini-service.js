const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class GeminiService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    async analyzeData(dataText, question) {
        try {
            const prompt = `
            Bạn là một chuyên gia phân tích dữ liệu. Hãy phân tích dữ liệu sau và trả lời câu hỏi:
            
            Dữ liệu: ${dataText}
            
            Câu hỏi: ${question}
            
            Hãy đưa ra phân tích chi tiết, insights và recommendations nếu có.
            `;

            const result = await this.model.generateContent(prompt);
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