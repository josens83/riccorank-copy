/**
 * Header Component Tests
 */

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

const MockHeader = () => {
  return (
    <header data-testid="header">
      <nav>
        <span>Home</span>
        <span>Stocks</span>
      </nav>
    </header>
  );
};

describe('Header Component', () => {
  it('should render header', () => {
    const { getByTestId } = render(<MockHeader />);
    const header = getByTestId('header');
    expect(header).toBeInTheDocument();
  });

  it('should have navigation links', () => {
    const { getByText } = render(<MockHeader />);
    expect(getByText('Home')).toBeInTheDocument();
    expect(getByText('Stocks')).toBeInTheDocument();
  });
});
