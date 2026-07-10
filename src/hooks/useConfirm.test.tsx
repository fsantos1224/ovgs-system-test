import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { ConfirmProvider } from './ConfirmContext';
import { useConfirm } from './useConfirm';
import { describe, it, expect, afterEach } from 'vitest';
import * as React from 'react';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

function TestComponent() {
  const confirm = useConfirm();
  const [result, setResult] = React.useState<null | boolean>(null);

  const handleClick = async () => {
    const result = await confirm({
      title: 'Test',
      body: <p>Are you sure?</p>,
    });
    setResult(result);
  };

  return (
    <div>
      <button data-testid="confirm-button" onClick={handleClick}>
        Open Confirm
      </button>
      <div data-testid="result">{result === null ? '' : String(result)}</div>
    </div>
  );
}

describe('useConfirm', () => {
  it('resolves to true when confirm button is clicked', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <ConfirmProvider>{children}</ConfirmProvider>;

    render(<TestComponent />, { wrapper });

    fireEvent.click(screen.getByTestId('confirm-button'));

    // Click the confirm button in the modal
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));

    // Wait for the result to be set
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('');
    });

    // After the modal closes, the result should be set
    expect(await screen.findByTestId('result')).toHaveTextContent('true');
  });

  it('resolves to false when cancel button is clicked', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <ConfirmProvider>{children}</ConfirmProvider>;

    render(<TestComponent />, { wrapper });

    fireEvent.click(screen.getByTestId('confirm-button'));

    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

    expect(await screen.findByTestId('result')).toHaveTextContent('false');
  });

  it('resolves to false when close (X) button is clicked', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <ConfirmProvider>{children}</ConfirmProvider>;

    render(<TestComponent />, { wrapper });

    fireEvent.click(screen.getByTestId('confirm-button'));

    fireEvent.click(screen.getByLabelText(/Fechar/i));

    expect(await screen.findByTestId('result')).toHaveTextContent('false');
  });
});
