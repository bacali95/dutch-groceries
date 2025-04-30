import { RefreshCcw } from 'lucide-react';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import type { ButtonProps } from 'tw-react-components';
import { Button } from 'tw-react-components';

export const RefreshButton: FC<ButtonProps> = (props) => {
  const navigate = useNavigate();

  return (
    <Button prefixIcon={RefreshCcw} {...props} onClick={() => navigate('.', { replace: true })} />
  );
};
