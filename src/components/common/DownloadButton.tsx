import { useState, type ReactNode } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, type ButtonProps } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/api-client';

interface DownloadButtonProps extends Omit<ButtonProps, 'onClick'> {
  onDownload: () => Promise<void>;
  children: ReactNode;
}

/** Button that runs a file download, shows progress and reports failures as a toast. */
export function DownloadButton({ onDownload, children, disabled, ...props }: DownloadButtonProps) {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      await onDownload();
    } catch (err) {
      toast.error(getErrorMessage(err, 'The file could not be downloaded.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button {...props} onClick={handleClick} disabled={disabled || busy}>
      {busy ? <Loader2 className="animate-spin" /> : <Download />}
      {children}
    </Button>
  );
}
