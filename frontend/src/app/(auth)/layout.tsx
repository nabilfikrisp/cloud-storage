import { Logo } from "@/components/logo";
import { H1 } from "@/components/typography/h1";
import { Paragraph } from "@/components/typography/paragraph";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <section className="bg-primary text-background hidden w-1/2 items-center justify-center p-10 lg:flex xl:w-2/5">
        <div className="space-y-8">
          <Logo withText />
          <div className="text-background space-y-4">
            <H1>Manage your files in your own cloud storage</H1>
            <Paragraph>
              This is a place where you store all your document safely.
            </Paragraph>
          </div>
          <div className="bg-background w-full overflow-hidden rounded-xl p-4">
            <div className="relative aspect-video w-full">
              <Image
                src="/assets/images/files.svg"
                alt="Files Illustration"
                fill
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background flex flex-1 flex-col items-center p-4 py-10 lg:justify-center lg:p-10 lg:py-0">
        <div className="mb-16 lg:hidden">
          <Logo withText />
        </div>
        {children}
      </section>
    </div>
  );
}
