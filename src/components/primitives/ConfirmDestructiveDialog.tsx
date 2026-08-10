/*
 * Copyright 2026 Shane
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Button } from "./Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./Dialog";

/**
 * Props for {@link ConfirmDestructiveDialog}.
 *
 * @since 1.0.0
 */
export interface ConfirmDestructiveDialogProps {
  confirmLabel: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}

/**
 * A confirmation modal for a destructive action, with a cancel button and a
 * danger-styled confirm button. A non-native replacement for a browser
 * `confirm()` popup.
 *
 * @since 1.0.0
 */
export const ConfirmDestructiveDialog = ({
  confirmLabel,
  message,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmDestructiveDialogProps) => (
  <Dialog
    onOpenChange={(next) => {
      if (!next) onCancel();
    }}
    open={open}
  >
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{message}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="destructive">
          {confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
