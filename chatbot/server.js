const express = require('express');
const cors = require('cors');
const GeminiService = require('./gemini-service');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const geminiService = new GeminiService();
// await geminiService.init();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let response;
        response = await geminiService.analyzeData(message);

        res.json({ response });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Có lỗi xảy ra khi xử lý yêu cầu' });
    }
});

// app.post('/api/insights', async (req, res) => {

//     try {

//         const { data } = req.body;



//         if (!data) {

//             return res.status(400).json({ error: 'Data is required' });

//         }



//         const insights = await geminiService.generateInsights(data);

//         res.json({ insights });

//     } catch (error) {

//         console.error('Insights error:', error);

//         res.status(500).json({ error: 'Không thể tạo insights' });

//     }

// });


app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Data Analysis Chatbot' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});