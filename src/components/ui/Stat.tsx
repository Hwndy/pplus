
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowDown, ArrowUp } from 'lucide-react';

const statVariants = cva(
  'flex flex-col',
  {
    variants: {
      variant: {
        default: '',
        bordered: 'p-4 border rounded-lg',
        shadowed: 'p-4 shadow-sm rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface StatProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statVariants> {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  subtitle?: string;
}

export function Stat({
  className,
  variant,
  label,
  value,
  icon,
  trend,
  trendLabel,
  subtitle,
  ...props
}: StatProps) {
  const showTrend = trend !== undefined;
  const trendIsPositive = trend ? trend > 0 : false;
  const trendIsNegative = trend ? trend < 0 : false;
  const trendAbsolute = trend ? Math.abs(trend) : 0;

  return (
    <div className={cn(statVariants({ variant }), className)} {...props}>
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
      
      {showTrend && (
        <div className="flex items-center mt-2">
          <div
            className={cn(
              'flex items-center text-xs font-medium',
              {
                'text-green-500': trendIsPositive,
                'text-red-500': trendIsNegative,
                'text-muted-foreground': !trendIsPositive && !trendIsNegative,
              }
            )}
          >
            {trendIsPositive && <ArrowUp className="mr-1 h-3 w-3" />}
            {trendIsNegative && <ArrowDown className="mr-1 h-3 w-3" />}
            <span>{trendIsPositive ? '+' : ''}{trendAbsolute}%</span>
          </div>
          {trendLabel && (
            <span className="ml-2 text-xs text-muted-foreground">
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
