import { NextRequest } from 'next/server';
import { handleApiError, successResponse, ApiError } from '@/lib/api-utils';
import { stockSymbolSchema } from '@/lib/utils/validations';
import { mockStocks } from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const { symbol } = stockSymbolSchema.parse(params);

    const stock = mockStocks.find((s) => s.symbol === symbol);

    if (!stock) {
      throw new ApiError(404, 'Stock not found');
    }

    // Add additional data for detail page
    const stockDetail = {
      ...stock,
      // Historical data (mock)
      history: generateHistoricalData(stock.currentPrice),
      // Related news (mock)
      relatedNews: [],
      // Trading volume breakdown
      volumeBreakdown: {
        retail: Math.floor(stock.volume * 0.4),
        foreign: Math.floor(stock.volume * 0.3),
        institutional: Math.floor(stock.volume * 0.3),
      },
      // Additional metrics
      metrics: {
        week52High: stock.currentPrice * 1.2,
        week52Low: stock.currentPrice * 0.8,
        avgVolume: stock.volume * 0.9,
        beta: 1.15,
        dividend: stock.currentPrice * 0.02,
        dividendYield: 2.0,
      },
    };

    return successResponse(stockDetail);
  } catch (error) {
    return handleApiError(error);
  }
}

// Helper function to generate mock historical data
function generateHistoricalData(currentPrice: number) {
  const data = [];
  let price = currentPrice * 0.9;

  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    price = price * (1 + (Math.random() - 0.5) * 0.05);

    data.push({
      date: date.toISOString().split('T')[0],
      open: price * 0.99,
      high: price * 1.02,
      low: price * 0.98,
      close: price,
      volume: Math.floor(Math.random() * 1000000) + 500000,
    });
  }

  return data;
}
