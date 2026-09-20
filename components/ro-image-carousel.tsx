"use client";

import Image from "next/image";

const images = Array.from({ length: 9 }, (_, index) => `/RO${index + 1}.jpeg`);

export function RoImageCarousel() {
  return (
    <div className="ro-image-carousel" aria-label="VINI RO product showcase">
      {images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={`Premium RO water purifier ${index + 1}`}
          fill
          priority={index === 0}
          sizes="(max-width: 760px) 92vw, 50vw"
          className="ro-carousel-image"
        />
      ))}
      <div className="ro-carousel-shade" />
      <div className="ro-carousel-dots" aria-hidden="true">
        {images.map((src) => (
          <span key={src} />
        ))}
      </div>
    </div>
  );
}
