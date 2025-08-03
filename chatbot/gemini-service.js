
const { createPartFromUri, createUserContent, GoogleGenAI } = require('@google/genai');
require('dotenv').config();

class GeminiService {
    constructor() {
        this.genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
        this.file = null;
    }

    async init() {
        await this.getData();
    }

    async analyzeData(question) {
        try {
            if (!this.file) {
                await this.getData();
            }

            const prompt = `
                    You are a data analyst. You are given an array of JSON objects. Each object represents one sales transaction and includes the following fields:

                    Use this data to answer the question below.

                    Question:
                    ${question}

                    🔍 Output format requirements:
                        1. Insight (human-style conclusion):
                            - Provide a short, natural language summary or insight.
                            - Do not use key-value pairs here.
                            - Keep it professional and business-oriented.
                        2. Then provide **supporting key-value pairs**, in this format:
                            - Respond using only "key: value"
                            - One key-value pair per line
                            - Do not return explanations or free text
                            - Use consistent, short, and descriptive keys
                            - If a value is missing, return: "key: Not available"
                            - Do not use bullet points, tables, or JSON
                            - All values should be in plain text or numbers
                            - If the insight involves product/item → you must include:
                                - itemName: [required]
                                - sku: [required]
                            - If the insight involves revenue, value, or money-related metrics → you must include:
                                - Formula: [e.g., revenue = quantity * price]
                                - Source Columns: [comma-separated original fields used in calculation]
                                - Show actual Source Column values only when the metric is calculated for a **specific item** or **specific order** (not aggregated total).
                                    - Format for value display:
                                        - Column Name: value
                                        - Example:
                                            Quantity: 10
                                            Price: 50
                                            Revenue: 500
                                    - For aggregated values across multiple items/orders, do NOT show all Source Column values (just formula + Source Columns is enough).

                                - If relevant fields are present in the data, also include:
                                    - CVR: [Conversion rate, e.g., conversions / impressions]
                                    - ROI: [Return on investment, e.g., (revenue - cost) / cost]
                                    - AOV: [Average order value, e.g., revenue / number of orders]
                                    - Cost: [If available]
                                    - CPC: [Cost per click, if clicks and cost available]
                                    - CPM: [Cost per 1000 impressions, if impressions and cost available]
                            - If the insight does NOT involve revenue or any financial metric, do NOT include financial details like AOV, ROI, CVR, cost, etc.
                    🔍 Important instructions:
                        - Use only the data provided in the file. Do not assume or hallucinate extra information.
                        - If any data point is missing or cannot be computed, say "Not available" or "Insufficient data".
                        - Use clear and concise bullet points or table format.
                        - Avoid flowery or poetic language. Keep the tone professional and data-focused.
                        - For forecasts, base the analysis only on trends visible in the provided data. Do not guess.

                    `;


            const result = await this.genAI.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: createUserContent([
                    createPartFromUri(this.file.uri ?? '', this.file.mimeType ?? 'text/csv'),
                    '\n\n',
                    prompt,

                ]),
            });
            return result.text;
        } catch (error) {
            console.error('Error analyzing data:', error);
            throw new Error('Không thể phân tích dữ liệu');
        }
    }

    // async generateInsights(data) {
    //     try {
    //         const prompt = `
    //         Phân tích dữ liệu sau và đưa ra những insights quan trọng:
    //         ${JSON.stringify(data, null, 2)}
            
    //         Hãy tìm ra:
    //         1. Xu hướng chính
    //         2. Điểm bất thường
    //         3. Cơ hội cải thiện
    //         4. Dự đoán
    //         `;

    //         const result = await this.model.generateContent(prompt);
    //         const response = await result.response;
    //         return response.text();
    //     } catch (error) {
    //         console.error('Error generating insights:', error);
    //         throw new Error('Không thể tạo insights');
    //     }
    // }
    async getData() {
        // thay bằng data khi call api
        const data =  [
            {
                OrderID: 1001,
                Customer: 'Alice',
                Product: 'Laptop',
                Category: 'Electronics',
                Price: 1200,
                Quantity: 1,
                OrderDate: '2024-05-01',
            },
            {
                OrderID: 1002,
                Customer: 'Bob',
                Product: 'Headphones',
                Category: 'Electronics',
                Price: 150,
                Quantity: 2,
                OrderDate: '2024-05-02',
            },
            {
                OrderID: 1003,
                Customer: 'Charlie',
                Product: 'Book',
                Category: 'Books',
                Price: 20,
                Quantity: 3,
                OrderDate: '2024-05-02',
            },
            {
                OrderID: 1004,
                Customer: 'Diana',
                Product: 'Desk',
                Category: 'Furniture',
                Price: 300,
                Quantity: 1,
                OrderDate: '2024-05-03',
            },
            {
                OrderID: 1005,
                Customer: 'Evan',
                Product: 'Monitor',
                Category: 'Electronics',
                Price: 250,
                Quantity: 2,
                OrderDate: '2024-05-03',
            },
            {
                OrderID: 1006,
                Customer: 'Fiona',
                Product: 'Chair',
                Category: 'Furniture',
                Price: 120,
                Quantity: 4,
                OrderDate: '2024-05-04',
            },
            {
                OrderID: 1007,
                Customer: 'George',
                Product: 'Notebook',
                Category: 'Books',
                Price: 5,
                Quantity: 10,
                OrderDate: '2024-05-04',
            },
            {
                OrderID: 1008,
                Customer: 'Hannah',
                Product: 'Phone',
                Category: 'Electronics',
                Price: 900,
                Quantity: 1,
                OrderDate: '2024-05-05',
            },
            {
                OrderID: 1009,
                Customer: 'Ian',
                Product: 'Lamp',
                Category: 'Furniture',
                Price: 80,
                Quantity: 2,
                OrderDate: '2024-05-05',
            },
            {
                OrderID: 1010,
                Customer: 'Jane',
                Product: 'Keyboard',
                Category: 'Electronics',
                Price: 100,
                Quantity: 1,
                OrderDate: '2024-05-06',
            },
        ];
        const jsonBuffer = Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
        const fileBlob = new Blob([jsonBuffer], { type: "text/csv" });
        this.file = await this.genAI.files.upload({
            file: fileBlob,
            config: { displayName: 'data.csv' },
        });
        return;
    }

}

module.exports = GeminiService;