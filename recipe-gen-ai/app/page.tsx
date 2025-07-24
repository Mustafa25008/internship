import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-10">
      <h1 className="text-3xl font-bold mb-6">🍳 AI Recipe Generator</h1>
      <Button>Get Started</Button>
    </main>
  );
}
