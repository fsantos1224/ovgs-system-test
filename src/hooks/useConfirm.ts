import { useContext } from 'react';
import { ConfirmContext, type ConfirmContextValue } from './ConfirmContext';

export function useConfirm(): ConfirmContextValue['confirm'] {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm deve ser usado dentro de <ConfirmProvider>');
  }
  return ctx.confirm;
}
