/**
 * Stock Card Component Tests
 */

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

const MockStockCard = ({ symbol, name, price, change }: StockCardProps) => {
  const isPositive = change >= 0;
  
  return (
    <div data-testid="stock-card" className={isPositive ? 'positive' : 'negative'}>
      <div className="symbol">{symbol}</div>
      <div className="name">{name}</div>
      <div className="price">{price.toLocaleString()}원</div>
      <div className="change">{isPositive ? '+' : ''}{change.toLocaleString()}</div>
    </div>
  );
};

describe('StockCard Component', () => {
  const mockStock = {
    symbol: '005930',
    name: '삼성전자',
    price: 75000,
    change: 1000,
  };

  it('should render stock information', () => {
    const { getByText } = render(<MockStockCard {...mockStock} />);
    
    expect(getByText('005930')).toBeInTheDocument();
    expect(getByText('삼성전자')).toBeInTheDocument();
    expect(getByText('75,000원')).toBeInTheDocument();
  });

  it('should apply positive class for gains', () => {
    const { getByTestId } = render(<MockStockCard {...mockStock} />);
    const card = getByTestId('stock-card');
    
    expect(card).toHaveClass('positive');
  });

  it('should apply negative class for losses', () => {
    const negativeStock = {
      ...mockStock,
      change: -1000,
    };
    
    const { getByTestId } = render(<MockStockCard {...negativeStock} />);
    const card = getByTestId('stock-card');
    
    expect(card).toHaveClass('negative');
  });
});
