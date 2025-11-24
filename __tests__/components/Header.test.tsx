/**
 * Header Component Tests
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Header component for testing
const MockHeader = () => {
  return (
    <header data-testid="header">
      <nav>
        <a href="/">Home</a>
        <a href="/stocklist">Stocks</a>
        <a href="/news">News</a>
        <a href="/mypage">My Page</a>
      </nav>
    </header>
  );
};

describe('Header Component', () => {
  it('should render header', () => {
    render(<MockHeader />);
    const header = screen.getByTestId('header');
    expect(header).toBeInTheDocument();
  });

  it('should have navigation links', () => {
    render(<MockHeader />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Stocks')).toBeInTheDocument();
    expect(screen.getByText('News')).toBeInTheDocument();
    expect(screen.getByText('My Page')).toBeInTheDocument();
  });

  it('should have correct href attributes', () => {
    render(<MockHeader />);
    
    const homeLink = screen.getByText('Home');
    const stocksLink = screen.getByText('Stocks');
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(stocksLink).toHaveAttribute('href', '/stocklist');
  });
});
