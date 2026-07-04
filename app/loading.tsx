import { ConsoleLoader } from "@/components/ui/ConsoleLoader";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <ConsoleLoader className="w-24 h-24 text-primary" label="Loading..." />
    </div>
  );
}