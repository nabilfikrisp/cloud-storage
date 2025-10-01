import { cn } from "@/lib/utils";

type ContainerProps = React.HTMLAttributes<HTMLDivElement>;

export function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div className={cn("max-width-app w-full", className)} {...props}>
      {children}
    </div>
  );
}
