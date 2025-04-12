import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Modal from '@/components/ui/Modal';

// Mock Headless UI's Dialog component to make it work in tests
jest.mock('@headlessui/react', () => {
  const DialogMock = ({ children, ...props }: any) => (
    <div data-testid="dialog" {...props}>
      {children}
    </div>
  );
  
  DialogMock.Panel = ({ children, className }: any) => (
    <div data-testid="dialog-panel" className={className}>
      {children}
    </div>
  );
  
  DialogMock.Title = ({ children, className }: any) => (
    <h3 data-testid="dialog-title" className={className}>
      {children}
    </h3>
  );
  
  const TransitionMock = ({ show, children }: any) => (show ? children : null);
  
  TransitionMock.Child = ({ children }: any) => <>{children}</>;
  
  return {
    Dialog: DialogMock,
    Transition: TransitionMock
  };
});

describe('Modal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders correctly when open', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <p data-testid="modal-content">Modal content</p>
      </Modal>
    );

    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Test Modal');
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <p data-testid="modal-content">Modal content</p>
      </Modal>
    );

    expect(screen.queryByTestId('dialog-title')).not.toBeInTheDocument();
    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await userEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders with different sizes', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose} size="sm">
        <p>Small modal</p>
      </Modal>
    );

    expect(screen.getByTestId('dialog-panel')).toHaveClass('max-w-sm');

    rerender(
      <Modal isOpen={true} onClose={mockOnClose} size="lg">
        <p>Large modal</p>
      </Modal>
    );

    expect(screen.getByTestId('dialog-panel')).toHaveClass('max-w-lg');

    rerender(
      <Modal isOpen={true} onClose={mockOnClose} size="full">
        <p>Full-width modal</p>
      </Modal>
    );

    expect(screen.getByTestId('dialog-panel')).toHaveClass('max-w-full');
  });

  it('renders without a close button when showCloseButton is false', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} showCloseButton={false}>
        <p>Modal without close button</p>
      </Modal>
    );

    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('renders with a footer when provided', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={mockOnClose} 
        footer={
          <>
            <button>Cancel</button>
            <button>Submit</button>
          </>
        }
      >
        <p>Modal with footer</p>
      </Modal>
    );

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Snapshot Test">
        <p>Modal content for snapshot</p>
      </Modal>
    );
    expect(container).toMatchSnapshot();
  });
});
