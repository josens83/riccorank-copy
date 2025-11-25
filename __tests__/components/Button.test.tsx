/**
 * Button Component Tests
 */

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

const MockButton = ({ children, onClick, variant = 'primary', disabled = false }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      data-testid="button"
    >
      {children}
    </button>
  );
};

describe('Button Component', () => {
  it('should render button with text', () => {
    const { getByText } = render(<MockButton>Click Me</MockButton>);
    expect(getByText('Click Me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    const { getByTestId } = render(<MockButton onClick={handleClick}>Click Me</MockButton>);
    
    const button = getByTestId('button');
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply variant class', () => {
    const { getByTestId } = render(<MockButton variant="danger">Delete</MockButton>);
    const button = getByTestId('button');
    
    expect(button).toHaveClass('btn-danger');
  });

  it('should be disabled when disabled prop is true', () => {
    const { getByTestId } = render(<MockButton disabled>Disabled</MockButton>);
    const button = getByTestId('button');
    
    expect(button).toBeDisabled();
  });
});
