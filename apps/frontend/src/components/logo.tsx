import { cn } from "@/lib/utils";
import Image from "next/image";
import { H1 } from "./typography/h1";

type LogoProps = { withText?: boolean } & React.HTMLAttributes<HTMLDivElement>;
export function Logo({ className, withText, ...props }: LogoProps) {
  return (
    <div className="bg-background flex w-fit items-center gap-2 rounded-xl px-2 py-1 pe-3">
      <div
        className={cn(
          "bg-background relative h-16 w-16 overflow-hidden rounded-xl",
          className,
        )}
        {...props}
      >
        <div className="absolute inset-1 overflow-hidden rounded-lg">
          <Image
            src="/favicon.ico"
            alt="logo"
            fill
            className="object-contain"
          />
        </div>
      </div>
      {withText && <H1 className="text-primary">CloudStorage</H1>}
    </div>
  );
}
