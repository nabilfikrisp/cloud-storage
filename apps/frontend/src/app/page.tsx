import { H1 } from "@/components/typography/h1";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="max-width-app w-full">
      <H1>Welcome to Cloud Storage</H1>
      <Button className="bg-success">Get Started</Button>
    </div>
  );
}
