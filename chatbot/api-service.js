const fetch = require('node-fetch');

require('dotenv').config();

async function getItemList() {
    try {
        const res = await fetch(`${process.env.ENDPOINT_CUSTOMER_SERVICE}/api/items`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!res.ok) throw new Error(`Status: ${res.status}`);


        return res.json()
    } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err.message);
    }
}

async function getOrderList() {
    try {
        const res = await fetch(`${process.env.ENDPOINT_CUSTOMER_SERVICE}/api/orders`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!res.ok) throw new Error(`Status: ${res.status}`);

        return res.json()

    } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err.message);
    }
}

async function getCustomerList() {
    try {
        const res = await fetch(`${process.env.ENDPOINT_CUSTOMER_SERVICE}/api/customers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!res.ok) throw new Error(`Status: ${res.status}`);

        return res.json()

    } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err.message);
    }
}

async function getSalesAnalytics() {
    try {
        const res = await fetch(`${process.env.ENDPOINT_CUSTOMER_SERVICE}/api/analytics/sales`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!res.ok) throw new Error(`Status: ${res.status}`);

        return res.json()

    } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err.message);
    }
}

async function getInventoryAnalytics() {
    try {
        const res = await fetch(`${process.env.ENDPOINT_CUSTOMER_SERVICE}/api/analytics/inventory`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!res.ok) throw new Error(`Status: ${res.status}`);

        return res.json()

    } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err.message);
    }
}

async function getRevenueAnalytics() {
    try {
        const res = await fetch(`${process.env.ENDPOINT_CUSTOMER_SERVICE}/api/analytics/revenue`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!res.ok) throw new Error(`Status: ${res.status}`);

        return res.json()

    } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err.message);
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
