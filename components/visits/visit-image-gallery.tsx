"use client";

import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface VisitImageGalleryProps {
  images?: string[];
  className?: string;
}

export function VisitImageGallery({ images, className }: VisitImageGalleryProps) {
  if (!images?.length) return null;

  return (
    <div className={cn("mt-4 border-t border-slate-100 pt-3", className)}>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <ImageIcon className="h-3.5 w-3.5" />
        Visit Images
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {images.map((image, index) => (
          <a
            key={`${image}-${index}`}
            href={image}
            target="_blank"
            rel="noreferrer"
            className="relative block h-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition-opacity duration-150 hover:opacity-90 sm:h-28"
          >
            <Image
              src={image}
              alt={`Visit image ${index + 1}`}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, 220px"
              className="object-cover"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
