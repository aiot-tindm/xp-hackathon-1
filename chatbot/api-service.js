const fetch = require('node-fetch');

require('dotenv').config();

async function fetchAllPaginatedData(endpoint, dataKey = 'items', limit = 100) {
    const allData = [];

    if (!process.env.ENDPOINT_CUSTOMER_SERVICE) {
        console.error("❌ ENDPOINT_CUSTOMER_SERVICE environment variable not set");
        return [];
    }

    let page = 1;

    try {
        while (true) {
            const url = `${process.env.ENDPOINT_CUSTOMER_SERVICE}${endpoint}?page=${page}&limit=${limit}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!res.ok) throw new Error(`Status: ${res.status}`);

            const json = await res.json();
            const currentPageData = json?.data?.[dataKey] || [];

            allData.push(...currentPageData);

            const totalPages = json?.data?.pagination?.totalPages || 1;

            if (page >= totalPages) break;

            page++;
        }

        return { dataKey : allData};
    } catch (err) {
        console.error(`❌ Lỗi khi gọi API ${endpoint}:`, err.message);
        return [];
    }
}


async function getItemList() {
    return await fetchAllPaginatedData('/api/items', 'items');

}

async function getOrderList() {
    // try {
    //     if (!process.env.ENDPOINT_CUSTOMER_SERVICE) {
    //         console.error("❌ ENDPOINT_CUSTOMER_SERVICE environment variable not set");
    //         return [];
    //     }

    //     const res = await fetch(`${process.env.ENDPOINT_CUSTOMER_SERVICE}/api/orders`, {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //     });

    //     if (!res.ok) throw new Error(`Status: ${res.status}`);

    //     return res.json();
    // } catch (err) {
    //     console.error("❌ Lỗi khi gọi API:", err.message);
    //     return [];
    // }
    return await fetchAllPaginatedData('/api/orders', 'orders');

}

async function getCustomerList() {
    // try {
    //     if (!process.env.ENDPOINT_CUSTOMER_SERVICE) {
    //         console.error("❌ ENDPOINT_CUSTOMER_SERVICE environment variable not set");
    //         return [];
    //     }

    //     const res = await fetch(`${process.env.ENDPOINT_CUSTOMER_SERVICE}/api/customers`, {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //     });

    //     if (!res.ok) throw new Error(`Status: ${res.status}`);

    //     return res.json();
    // } catch (err) {
    //     console.error("❌ Lỗi khi gọi API:", err.message);
    //     return [];
    // }
    return await fetchAllPaginatedData('/api/customers', 'customers');

}

async function getSalesAnalytics() {
    try {
        if (!process.env.ENDPOINT_CUSTOMER_SERVICE) {
            console.error("❌ ENDPOINT_CUSTOMER_SERVICE environment variable not set");
            return {};
        }

        const res = await fetch(`${process.env.ENDPOINT_CUSTOMER_SERVICE}/api/analytics/sales`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!res.ok) throw new Error(`Status: ${res.status}`);

        return res.json();
    } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err.message);
        return {};
    }
}

async function getInventoryAnalytics() {
    try {
        if (!process.env.ENDPOINT_CUSTOMER_SERVICE) {
            console.error("❌ ENDPOINT_CUSTOMER_SERVICE environment variable not set");
            return {};
        }

        const res = await fetch(`${process.env.ENDPOINT_CUSTOMER_SERVICE}/api/analytics/inventory`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!res.ok) throw new Error(`Status: ${res.status}`);

        return res.json();
    } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err.message);
        return {};
    }
}

async function getRevenueAnalytics() {
    try {
        if (!process.env.ENDPOINT_CUSTOMER_SERVICE) {
            console.error("❌ ENDPOINT_CUSTOMER_SERVICE environment variable not set");
            return {};
        }

        const res = await fetch(`${process.env.ENDPOINT_CUSTOMER_SERVICE}/api/analytics/revenue`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!res.ok) throw new Error(`Status: ${res.status}`);

        return res.json();
    } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err.message);
        return {};
    }
}

module.exports = {
    getItemList,
    getOrderList,
    getCustomerList,
    getSalesAnalytics,
    getInventoryAnalytics,
    getRevenueAnalytics,
};
