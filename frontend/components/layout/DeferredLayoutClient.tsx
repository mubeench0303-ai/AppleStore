"use client";

import dynamic from "next/dynamic";

const ScrollProgress = dynamic(() => import("@/components/motion/ScrollProgress"), { ssr: false });
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer"), { ssr: false });

export default function DeferredLayoutClient() {
  return (
    <>
      <ScrollProgress />
      <CartDrawer />
    </>
  );
}
