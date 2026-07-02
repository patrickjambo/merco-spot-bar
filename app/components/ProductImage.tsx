"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// next/image that swaps to a safe fallback if the primary source fails to load
// (e.g. a dead external link or a missing legacy path), so cards never show a
// broken image icon.
export default function ProductImage({
  src,
  fallback,
  alt,
  className,
  sizes,
}: {
  src: string;
  fallback: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const [current, setCurrent] = useState(src);

  // Reset when the product (src) changes so filtered/re-rendered lists stay correct.
  useEffect(() => {
    setCurrent(src);
  }, [src]);

  return (
    <Image
      src={current}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
    />
  );
}
