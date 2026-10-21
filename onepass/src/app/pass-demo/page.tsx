import type { Metadata } from "next";
import HoloCardDemo from "@/components/ui/demo";

export const metadata: Metadata = {
  title: "Inlo Holographic Pass Demo | Inlo",
  description: "Interactive pearl titanium holographic pass demonstration.",
};

export default function PassDemoPage() {
  return (
    <main className="min-h-screen">
      <HoloCardDemo />
    </main>
  );
}
