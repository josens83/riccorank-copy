/**
 * Stock Card Component Tests
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const MockStockCard = ({ symbol, name, price, change, changePercent }: StockCardProps) => {
  const isPositive = change >= 0;
  
  return (
    <div data-testid="stock-card" className={isPositive ? 'positive' : 'negative'}>
      <div className="symbol">{symbol}</div>
      <div className="name">{name}</div>
      <div className="price">{price.toLocaleString()}원</div>
      <div className="change">
        {isPositive ? '+' : ''}{change.toLocaleString()}
        ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
      </div>
    </div>
  );
};

describe('StockCard Component', () => {
  const mockStock = {
    symbol: '005930',
    name: '삼성전자',
    price: 75000,
    change: 1000,
    changePercent: 1.35,
  };

  it('should render stock information', () => {
    render(<MockStockCard {...mockStock} />);
    
    expect(screen.getByText('005930')).toBeInTheDocument();
    expect(screen.getByText('삼성전자')).toBeInTheDocument();
    expect(screen.getByText('75,000원')).toBeInTheDocument();
  });

  it('should display positive change with + sign', () => {
    render(<MockStockCard {...mockStock} />);
    
    const changeText = screen.getByText(/\+1,000/);
    expect(changeText).toBeInTheDocument();
  });

  it('should display negative change without + sign', () => {
    const negativeStock = {
      ...mockStock,
      change: -1000,
      changePercent: -1.35,
    };
    
    render(<MockStockCard {...negativeStock} />);
    
    const changeText = screen.getByText(/-1,000/);
    expect(changeText).toBeInTheDocument();
  });

  it('should apply positive class for gains', () => {
    render(<MockStockCard {...mockStock} />);
    const card = screen.getByTestId('stock-card');
    
    expect(card).toHaveClass('positive');
  });

  it('should apply negative class for losses', () => {
    const negativeStock = {
      ...mockStock,
      change: -1000,
      changePercent: -1.35,
    };
    
    render(<MockStockCard {...negativeStock} />);
    const card = screen.getByTestId('stock-card');
    
    expect(card).toHaveClass('negative');
  });

  it('should format price with thousand separators', () => {
    const expensiveStock = {
      ...mockStock,
      price: 1234567,
    };
    
    render(<MockStockCard {...expensiveStock} />);
    expect(screen.getByText('1,234,567원')).toBeInTheDocument();
  });

  it('should format percentage with 2 decimal places', () => {
    render(<MockStockCard {...mockStock} />);
    expect(screen.getByText(/1\.35%/)).toBeInTheDocument();
  });
});
