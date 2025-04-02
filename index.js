require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Helper function to get stock data
async function getStockData(symbol) {
    try {
        const response = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching stock data:', error);
        throw error;
    }
}

// Route to get stock comparison data
app.get('/api/compare/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const [stockData, sp500Data] = await Promise.all([
            getStockData(symbol),
            getStockData('SPY') // Using SPY ETF as a proxy for S&P 500
        ]);

        // Process the data to get the last 7 days of prices
        const stockPrices = Object.entries(stockData['Time Series (Daily)'])
            .slice(0, 7)
            .map(([date, data]) => ({
                date,
                price: parseFloat(data['4. close'])
            }));

        const sp500Prices = Object.entries(sp500Data['Time Series (Daily)'])
            .slice(0, 7)
            .map(([date, data]) => ({
                date,
                price: parseFloat(data['4. close'])
            }));

        // Calculate percentage changes
        const stockChange = ((stockPrices[0].price - stockPrices[6].price) / stockPrices[6].price) * 100;
        const sp500Change = ((sp500Prices[0].price - sp500Prices[6].price) / sp500Prices[6].price) * 100;

        res.json({
            stock: {
                symbol,
                prices: stockPrices,
                change: stockChange
            },
            sp500: {
                prices: sp500Prices,
                change: sp500Change
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stock data' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});