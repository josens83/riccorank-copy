/**
 * Button Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Button component
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
    render(<MockButton>Click Me</MockButton>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<MockButton onClick={handleClick}>Click Me</MockButton>);
    
    const button = screen.getByTestId('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply variant class', () => {
    render(<MockButton variant="danger">Delete</MockButton>);
    const button = screen.getByTestId('button');
    
    expect(button).toHaveClass('btn-danger');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<MockButton disabled>Disabled</MockButton>);
    const button = screen.getByTestId('button');
    
    expect(button).toBeDisabled();
  });

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<MockButton onClick={handleClick} disabled>Disabled</MockButton>);
    
    const button = screen.getByTestId('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });
});
