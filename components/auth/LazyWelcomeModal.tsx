"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const WelcomeModal = dynamic(() => import("@/components/auth/WelcomeModal"), { ssr: false });

export default function LazyWelcomeModal() {
  return (
    <Suspense fallback={null}>
      <WelcomeModal />
    </Suspense>
  );
}
