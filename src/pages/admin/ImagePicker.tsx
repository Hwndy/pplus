import { useEffect, useId, useMemo, useRef, type ChangeEvent } from 'react';
import { ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

function validationError(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Choose a JPEG, PNG, GIF or WebP image.';
  if (file.size > MAX_BYTES) return 'The image must be 5 MB or smaller.';
  return null;
}

interface ImagePickerProps {
  label: string;
  description?: string;
  /** URL of the image already saved on the server. */
  imageUrl?: string | null;
  /** A chosen file that has not been uploaded yet; previewed instead of `imageUrl`. */
  pendingFile?: File | null;
  /** Called with a validated file (JPEG, PNG, GIF or WebP, at most 5 MB). */
  onSelect: (file: File) => void | Promise<void>;
  onRemove: () => void | Promise<void>;
  /** Upload or removal in progress. */
  busy?: boolean;
  disabled?: boolean;
  /** `wide` for banners/covers, `round` for portraits, `square` for logos. */
  shape?: 'square' | 'round' | 'wide';
  className?: string;
}

/** Image slot with preview, Upload/Replace and Remove, validating type and size before handing the file over. */
export function ImagePicker({
  label, description, imageUrl, pendingFile, onSelect, onRemove, busy, disabled, shape = 'square', className,
}: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();
  const fileUrl = useMemo(() => (pendingFile ? URL.createObjectURL(pendingFile) : null), [pendingFile]);
  useEffect(() => () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
  }, [fileUrl]);

  const preview = fileUrl ?? imageUrl ?? null;
  const locked = busy || disabled;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const error = validationError(file);
    if (error) {
      toast.error(error);
      return;
    }
    void onSelect(file);
  }

  return (
    <div className={cn('flex items-start gap-4 rounded-lg border p-3', className)} role="group" aria-labelledby={labelId}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden border bg-muted',
          shape === 'wide' ? 'h-20 w-36 rounded-md' : 'h-20 w-20',
          shape === 'round' ? 'rounded-full' : shape === 'square' && 'rounded-md',
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt={`${label} preview`}
            className={cn('h-full w-full', shape === 'square' ? 'object-contain' : 'object-cover')}
          />
        ) : (
          <ImageIcon className="h-6 w-6 text-muted-foreground" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="space-y-0.5">
          <p id={labelId} className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">
            {pendingFile ? `${pendingFile.name} · uploaded when you save` : description ?? 'JPEG, PNG, GIF or WebP, up to 5 MB.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={handleChange}
            aria-label={`Choose ${label.toLowerCase()}`}
          />
          <Button type="button" variant="outline" size="sm" disabled={locked} onClick={() => inputRef.current?.click()}>
            {busy ? <Loader2 className="animate-spin" /> : <Upload />}
            {preview ? 'Replace' : 'Upload'}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={locked}
              onClick={() => void onRemove()}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 /> Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
