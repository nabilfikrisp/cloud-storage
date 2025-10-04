import { cn } from "@/lib/utils";

type ParagraphProps = {
  size?: "default" | "small";
} & React.HTMLAttributes<HTMLParagraphElement>;
export function Paragraph({
  children,
  className,
  size = "default",
  ...props
}: ParagraphProps) {
  return (
    <p
      className={cn("font-normal", ParagraphTextSize[size], className)}
      {...props}
    >
      {children}
    </p>
  );
}

const ParagraphTextSize = {
  ["default"]: "text-[16px] leading-[24px]",
  ["small"]: "text-[14px] leading-[20px]",
};
