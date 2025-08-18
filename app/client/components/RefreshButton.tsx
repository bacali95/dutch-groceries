import { RefreshCcw } from 'lucide-react';
import type { FC } from 'react';
import type { ButtonProps } from 'tw-react-components';
import { Button } from 'tw-react-components';

export const RefreshButton: FC<ButtonProps & { onClick: () => void }> = (props) => {
  return <Button prefixIcon={RefreshCcw} {...props} />;
};
