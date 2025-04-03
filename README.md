# Stock vs S&P 500 Comparison
Sample app built to experiment with CursorAI. Can be used to compare the performance of any stock ticker symbol to the S&P 500 over the last 7 days.

## Setup
Recommended NodeJS version: `v23.x`

### 1. API Key Setup
The app uses [Alpha Vantage](https://www.alphavantage.co/)'s free stock price API to access stock data.

 1. Visit their site to obtain an API key.
 1. create a `.env` file in the root directory of the project and add
    ```
    ALPHA_VANTAGE_API_KEY=your_api_key_here
    ```
### 2. Install dependencies
```sh
npm i
```

## Running the app

Start the server:
```sh
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to access the app.