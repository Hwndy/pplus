
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const dataCardVariants = cva(
  "transition-all duration-300 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-card",
        glass: "card-glass",
        outlined: "border-2 bg-transparent",
      },
      size: {
        sm: "p-2",
        default: "",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface DataCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dataCardVariants> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export function DataCard({
  className,
  variant,
  size,
  title,
  description,
  icon,
  footer,
  children,
  ...props
}: DataCardProps) {
  return (
    <Card
      className={cn(dataCardVariants({ variant, size, className }))}
      {...props}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {footer && (
        <div className="px-6 py-4 bg-muted/20 mt-2">
          {footer}
        </div>
      )}
    </Card>
  );
}
