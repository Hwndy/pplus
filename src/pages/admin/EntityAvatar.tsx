import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

function initials(name: string): string {
  const letters = name.trim().split(/\s+/).slice(0, 2).map((word) => word.charAt(0));
  return letters.join('').toUpperCase() || '?';
}

/** Small thumbnail for a company logo or person photo, falling back to initials. */
export function EntityAvatar({ name, imageUrl, rounded = 'md', className }: {
  name: string;
  imageUrl?: string | null;
  /** `md` for logos, `full` for portraits. */
  rounded?: 'md' | 'full';
  className?: string;
}) {
  const shape = rounded === 'full' ? 'rounded-full' : 'rounded-md';
  return (
    <Avatar className={cn('h-9 w-9 border', shape, className)}>
      {imageUrl && (
        <AvatarImage
          src={imageUrl}
          alt=""
          className={rounded === 'full' ? 'object-cover' : 'bg-background object-contain'}
        />
      )}
      <AvatarFallback className={cn('text-xs font-medium text-muted-foreground', shape)}>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
