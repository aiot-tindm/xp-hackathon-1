const { createPartFromUri, createUserContent, GoogleGenAI } = require('@google/genai');
const { getItemList, getOrderList, getCustomerList, getSalesAnalytics, getInventoryAnalytics, getRevenueAnalytics } = require('./api-service');
require('dotenv').config();

class GeminiService {
    constructor() {
        this.genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
        this.fileContent = [];
    }

    async init() {
        await this.fetchData();
    }

    async analyzeData(question) {
        try {
            if (!this.fileContent.length) {
                await this.fetchData();
            }

            const prompt = `
                    You are a data analyst. You are given an array of JSON objects. Each object represents one sales transaction and includes the following fields:
 
                    Use this data to answer the question below.
 
                    Question:
                    ${question}
 
                    🔍 Output format requirements:
                        1. Insight (human-style conclusion):
                            - Provide a short, natural language summary or insight.
                            - Do NOT use key-value pairs here.
                            - Keep it professional and business-oriented.
 
                        2. Reference (optional):
                            - Only include this section if the question relates to: sales performance, revenue, top-selling products, or top-performing brands...
                            - Do NOT include this section for planning, strategy, or recommendation-style questions.
                            - Respond using only "key: value"
                            - One key-value pair per line
                            - Do not return explanations or free text
                            - Use consistent, short, and descriptive keys
                            - If a value is missing, return: "key: Not available"
                            - Do not use bullet points, tables, or JSON
                            - All values should be in plain text or numbers
                            - If the insight involves product/item → you must include:
                                - Item Name: [required]
                                - Sku: [required]
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
                    ...this.fileContent,
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
    async uploadFile(data, fileName) {

        const jsonBuffer = Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
        const fileBlob = new Blob([jsonBuffer], { type: "text/csv" });
        const file = await this.genAI.files.upload({
            file: fileBlob,
            config: { displayName: `${fileName}.csv` },
        });
        this.fileContent.push(createPartFromUri(file.uri, file.mimeType))
        return;
    }
    async fetchData() {
        const items = await getItemList();
        if (items && items.length > 0) {
            await this.uploadFile(items, 'items');
        }

        const orders = await getOrderList();
        if (orders && orders.length > 0) {
            await this.uploadFile(orders, 'orders');
        }

        const customers = await getCustomerList();
        if (customers && customers.length > 0) {
            await this.uploadFile(customers, 'customers');
        }

        const sales = await getSalesAnalytics();
        if (sales && Object.keys(sales).length > 0) {
            await this.uploadFile(sales, 'sales');
        }

        const inventory = await getInventoryAnalytics();
        if (inventory && Object.keys(inventory).length > 0) {
            await this.uploadFile(inventory, 'inventoryAnalytics');
        }

        const revenue = await getRevenueAnalytics();
        if (revenue && Object.keys(revenue).length > 0) {
            await this.uploadFile(revenue, 'revenueAnalytics');
        }

        console.log(
            items?.length ?? 0,
            orders?.length ?? 0,
            customers?.length ?? 0,
            Object.keys(sales ?? {}).length,
            Object.keys(inventory ?? {}).length,
            Object.keys(revenue ?? {}).length
        );
    }


}

module.exports = GeminiService;