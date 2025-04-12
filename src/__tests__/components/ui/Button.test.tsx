import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Button from '@/components/ui/Button';
import { faUser } from '@fortawesome/free-solid-svg-icons';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    const button = getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-blue');
  });

  it('renders with different variants', () => {
    const { getByRole, rerender } = render(<Button variant="secondary">Secondary</Button>);
    expect(getByRole('button')).toHaveClass('bg-gray');

    rerender(<Button variant="success">Success</Button>);
    expect(getByRole('button')).toHaveClass('bg-green');

    rerender(<Button variant="danger">Danger</Button>);
    expect(getByRole('button')).toHaveClass('bg-red');
  });

  it('renders with different sizes', () => {
    const { getByRole, rerender } = render(<Button size="sm">Small</Button>);
    expect(getByRole('button')).toHaveClass('text-sm');

    rerender(<Button size="lg">Large</Button>);
    expect(getByRole('button')).toHaveClass('text-lg');
  });

  it('renders with an icon', () => {
    const { getByRole } = render(<Button icon={faUser}>With Icon</Button>);
    const icon = getByRole('img', { hidden: true });
    expect(icon).toBeInTheDocument();
  });

  it('renders in loading state', () => {
    const { getByRole } = render(<Button loading>Loading</Button>);
    const spinner = getByRole('img', { hidden: true });
    expect(spinner).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    const { getByRole } = render(<Button onClick={handleClick}>Click me</Button>);
    const button = getByRole('button');
    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = jest.fn();
    const { getByRole } = render(<Button disabled onClick={handleClick}>Disabled</Button>);
    const button = getByRole('button');
    await userEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders as full width when fullWidth prop is true', () => {
    const { getByRole } = render(<Button fullWidth>Full Width</Button>);
    expect(getByRole('button')).toHaveClass('w-full');
  });

  // Snapshot test
  it('matches snapshot', () => {
    const { container } = render(<Button>Snapshot Test</Button>);
    expect(container).toMatchSnapshot();
  });
});
