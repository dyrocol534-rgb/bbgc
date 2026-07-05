"use client";

import dynamic from "next/dynamic";

const WelcomeModal = dynamic(() => import("@/components/auth/WelcomeModal"), { ssr: false });

export default function LazyWelcomeModal() {
  return <WelcomeModal />;
}
