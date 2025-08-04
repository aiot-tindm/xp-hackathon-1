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
                    Bạn là một chuyên gia phân tích dữ liệu. Bạn được cung cấp một mảng các đối tượng JSON. Mỗi đối tượng đại diện cho một giao dịch bán hàng.
 
                    Sử dụng dữ liệu này để trả lời câu hỏi dưới đây BẰNG TIẾNG VIỆT.
 
                    Câu hỏi:
                    ${question}
 
                    🔍 Yêu cầu định dạng đầu ra (BẰNG TIẾNG VIỆT):
                        1. Phân tích (kết luận tự nhiên):
                            - Cung cấp tóm tắt hoặc thông tin chi tiết ngắn gọn bằng ngôn ngữ tự nhiên.
                            - KHÔNG sử dụng cặp key-value ở đây.
                            - Giữ tông điệu chuyên nghiệp và hướng kinh doanh.
                            - Trả lời hoàn toàn bằng tiếng Việt.
 
                        2. Tham khảo (tùy chọn):
                            - Chỉ bao gồm phần này nếu câu hỏi liên quan đến: hiệu suất bán hàng, doanh thu, sản phẩm bán chạy nhất, hoặc thương hiệu hoạt động tốt nhất...
                            - KHÔNG bao gồm phần này cho các câu hỏi về kế hoạch, chiến lược, hoặc đề xuất.
                            - Trả lời chỉ sử dụng định dạng "key: value" BẰNG TIẾNG VIỆT
                            - Một cặp key-value trên mỗi dòng
                            - Không trả về giải thích hoặc văn bản tự do
                            - Sử dụng các key ngắn gọn, mô tả và nhất quán bằng tiếng Việt
                            - Nếu thiếu giá trị, trả về: "key: Không có dữ liệu"
                            - Không sử dụng dấu đầu dòng, bảng, hoặc JSON
                            - Tất cả giá trị phải ở dạng văn bản thuần túy hoặc số
                            - Nếu phân tích liên quan đến sản phẩm/mặt hàng → bạn phải bao gồm:
                                - Tên sản phẩm: [bắt buộc]
                                - Mã SKU: [bắt buộc]
                            - Nếu phân tích liên quan đến doanh thu, giá trị, hoặc các chỉ số tiền tệ → bạn phải bao gồm:
                                - Công thức: [ví dụ: doanh thu = số lượng * giá]
                                - Các cột nguồn: [các trường dữ liệu gốc được sử dụng trong tính toán, cách nhau bằng dấu phẩy]
                                - Chỉ hiển thị giá trị cột nguồn thực tế khi chỉ số được tính cho **một mặt hàng cụ thể** hoặc **một đơn hàng cụ thể** (không phải tổng tích lũy).
                                    - Định dạng hiển thị giá trị:
                                        - Tên cột: giá trị
                                        - Ví dụ:
                                            Số lượng: 10
                                            Giá: 50
                                            Doanh thu: 500
                                    - Đối với giá trị tích lũy qua nhiều mặt hàng/đơn hàng, KHÔNG hiển thị tất cả giá trị cột nguồn (chỉ cần công thức + cột nguồn là đủ).
 
                                - Nếu các trường liên quan có trong dữ liệu, cũng bao gồm:
                                    - Tỷ lệ chuyển đổi: [tỷ lệ chuyển đổi, ví dụ: chuyển đổi / lượt hiển thị]
                                    - ROI: [lợi tức đầu tư, ví dụ: (doanh thu - chi phí) / chi phí]
                                    - Giá trị đơn hàng trung bình: [ví dụ: doanh thu / số đơn hàng]
                                    - Chi phí: [nếu có]
                                    - CPC: [chi phí mỗi lần nhấp, nếu có dữ liệu nhấp chuột và chi phí]
                                    - CPM: [chi phí mỗi 1000 lượt hiển thị, nếu có dữ liệu hiển thị và chi phí]
                            - Nếu phân tích KHÔNG liên quan đến doanh thu hoặc bất kỳ chỉ số tài chính nào, KHÔNG bao gồm các chi tiết tài chính như AOV, ROI, CVR, chi phí, v.v.
                    🔍 Hướng dẫn quan trọng:
                        - Chỉ sử dụng dữ liệu được cung cấp trong tệp. Không giả định hoặc tạo ra thông tin thêm.
                        - Nếu bất kỳ điểm dữ liệu nào bị thiếu hoặc không thể tính toán, hãy nói "Không có dữ liệu" hoặc "Dữ liệu không đủ".
                        - Sử dụng dấu đầu dòng rõ ràng và ngắn gọn hoặc định dạng bảng.
                        - Tránh ngôn ngữ hoa mỹ hoặc thơ ca. Giữ tông điệu chuyên nghiệp và tập trung vào dữ liệu.
                        - Đối với dự báo, chỉ dựa trên xu hướng có thể nhìn thấy trong dữ liệu được cung cấp. Không đoán.
                        - TẤT CẢ PHẢN HỒI PHẢI BẰNG TIẾNG VIỆT.
 
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
        if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) {
            console.log(`⚠️ Skipping upload for ${fileName} - no data available`);
            return;
        }

        try {
            const jsonBuffer = Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
            const fileBlob = new Blob([jsonBuffer], { type: "text/csv" });
            const file = await this.genAI.files.upload({
                file: fileBlob,
                config: { displayName: `${fileName}.csv` },
            });
            this.fileContent.push(createPartFromUri(file.uri, file.mimeType));
            console.log(`✅ Uploaded ${fileName} with ${Array.isArray(data) ? data.length : 'object'} items`);
        } catch (error) {
            console.error(`❌ Failed to upload ${fileName}:`, error.message);
        }
    }
    async fetchData() {
        try {
            console.log('📊 Fetching data from customer service API...');
            
            const items = await getItemList();
            await this.uploadFile(items, 'items');

            const orders = await getOrderList();
            await this.uploadFile(orders, 'orders');

            const customers = await getCustomerList();
            await this.uploadFile(customers, 'customers');

            const sales = await getSalesAnalytics();
            await this.uploadFile(sales.data, 'sales');

            const inventory = await getInventoryAnalytics();
            await this.uploadFile(inventory.data, 'inventoryAnalytics');

            const revenue = await getRevenueAnalytics();
            await this.uploadFile(revenue.data, 'revenueAnalytics');

            console.log('📈 Data summary:', {
                items: items?.length ?? 0,
                orders: orders?.length ?? 0,
                customers: customers?.length ?? 0,
                sales: Object.keys(sales ?? {}).length,
                inventory: Object.keys(inventory ?? {}).length,
                revenue: Object.keys(revenue ?? {}).length
            });

            if (this.fileContent.length === 0) {
                console.warn('⚠️ No data available from customer service API');
            } else {
                console.log(`✅ Successfully loaded ${this.fileContent.length} data files`);
            }
            return 
        } catch (error) {
            console.error('❌ Error fetching data:', error.message);
            throw new Error('Failed to fetch data from customer service');
        }
    }


}

module.exports = GeminiService;