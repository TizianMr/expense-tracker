import { Button, Text } from '@chakra-ui/react';

import {
  DialogActionTrigger,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from './ui/dialog';

type Props = {
  title: string;
  description: string;
  isOpen: boolean;
  isSubmitting: boolean;
  secondaryActionText?: string;
  primaryActionText?: string;
  onClose: () => void;
  onSubmit: () => void;
};

export const ConfirmationDialog = ({
  title,
  description,
  isOpen,
  isSubmitting,
  primaryActionText = 'Delete',
  secondaryActionText = 'Cancel',
  onClose,
  onSubmit,
}: Props) => {
  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={onClose}>
      <DialogBackdrop />
      <DialogContent>
        <DialogCloseTrigger />
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>{description}</Text>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant='outline'>{secondaryActionText}</Button>
          </DialogActionTrigger>
          <Button
            colorPalette='red'
            loading={isSubmitting}
            type='submit'
            onClick={onSubmit}>
            {primaryActionText}
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default ConfirmationDialog;
