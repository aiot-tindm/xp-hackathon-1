const fetch = require('node-fetch');

require('dotenv').config();

async function getItemList() {
    try {
        if (!process.env.ENDPOINT_CUSTOMER_SERVICE) {
            console.error("❌ ENDPOINT_CUSTOMER_SERVICE environment variable not set");
            return [];
        }

        const res = await fetch(`${process.env.ENDPOINT_CUSTOMER_SERVICE}/api/items`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!res.ok) throw new Error(`Status: ${res.status}`);

        return res.json();
    } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err.message);
        return [];
    }
}

async function getOrderList() {
    try {
        if (!process.env.ENDPOINT_CUSTOMER_SERVICE) {
            console.error("❌ ENDPOINT_CUSTOMER_SERVICE environment variable not set");
            return [];
        }

        const res = await fetch(`${process.env.ENDPOINT_CUSTOMER_SERVICE}/api/orders`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!res.ok) throw new Error(`Status: ${res.status}`);

        return res.json();
    } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err.message);
        return [];
    }
}

async function getCustomerList() {
    try {
        if (!process.env.ENDPOINT_CUSTOMER_SERVICE) {
            console.error("❌ ENDPOINT_CUSTOMER_SERVICE environment variable not set");
            return [];
        }

        const res = await fetch(`${process.env.ENDPOINT_CUSTOMER_SERVICE}/api/customers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!res.ok) throw new Error(`Status: ${res.status}`);

        return res.json();
    } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err.message);
        return [];
    }
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
