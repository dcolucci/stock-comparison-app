const request = require('supertest');
const express = require('express');
const axios = require('axios');
const app = require('../index');

// Mock axios to avoid making real API calls during tests
jest.mock('axios');

describe('Stock Comparison API', () => {
  // Sample mock data
  const mockStockData = {
    'Time Series (Daily)': {
      '2024-04-03': { '4. close': '100.00' },
      '2024-04-02': { '4. close': '98.00' },
      '2024-04-01': { '4. close': '97.00' },
      '2024-03-29': { '4. close': '96.00' },
      '2024-03-28': { '4. close': '95.00' },
      '2024-03-27': { '4. close': '94.00' },
      '2024-03-26': { '4. close': '93.00' }
    }
  };

  const mockSP500Data = {
    'Time Series (Daily)': {
      '2024-04-03': { '4. close': '500.00' },
      '2024-04-02': { '4. close': '495.00' },
      '2024-04-01': { '4. close': '490.00' },
      '2024-03-29': { '4. close': '485.00' },
      '2024-03-28': { '4. close': '480.00' },
      '2024-03-27': { '4. close': '475.00' },
      '2024-03-26': { '4. close': '470.00' }
    }
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock responses
    axios.get.mockImplementation((url) => {
      if (url.includes('SPY')) {
        return Promise.resolve({ data: mockSP500Data });
      }
      return Promise.resolve({ data: mockStockData });
    });
  });

  describe('GET /api/compare/:symbol', () => {
    it('should return stock and S&P 500 comparison data', async () => {
      const response = await request(app).get('/api/compare/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('stock');
      expect(response.body).toHaveProperty('sp500');
      
      // Check stock data structure
      expect(response.body.stock).toHaveProperty('symbol', 'AAPL');
      expect(response.body.stock).toHaveProperty('prices');
      expect(response.body.stock).toHaveProperty('change');
      
      // Check S&P 500 data structure
      expect(response.body.sp500).toHaveProperty('prices');
      expect(response.body.sp500).toHaveProperty('change');
      
      // Verify the number of price points
      expect(response.body.stock.prices).toHaveLength(7);
      expect(response.body.sp500.prices).toHaveLength(7);
    });

    it('should handle invalid stock symbols', async () => {
      axios.get.mockRejectedValueOnce(new Error('Invalid symbol'));
      
      const response = await request(app).get('/api/compare/INVALID');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch stock data');
    });

    it('should calculate correct percentage changes', async () => {
      const response = await request(app).get('/api/compare/AAPL');
      
      // Stock change: (100 - 93) / 93 * 100 ≈ 7.53%
      expect(response.body.stock.change).toBeCloseTo(7.53, 2);
      
      // S&P 500 change: (500 - 470) / 470 * 100 ≈ 6.38%
      expect(response.body.sp500.change).toBeCloseTo(6.38, 2);
    });
  });
}); 