import { cn } from "@/lib/utils";

type H1Props = React.HTMLAttributes<HTMLHeadingElement>;

export function H1({ children, className, ...props }: H1Props) {
  return (
    <h1
      className={cn("text-[34px] leading-tight font-bold", className)}
      {...props}
    >
      {children}
    </h1>
  );
}
