import Image from 'next/image'
import type { ImageData } from '@/types'

interface TemplateGalleryProps {
  images: ImageData[]
}

export function TemplateGallery({ images }: TemplateGalleryProps) {
  const [mainImage, ...rest] = images

  return (
    <div className="space-y-3">
      <div className="aspect-[16/10] rounded-xl overflow-hidden bg-surface-2">
        <Image
          src={mainImage.src}
          alt={mainImage.alt}
          width={mainImage.width}
          height={mainImage.height}
          className="w-full h-full object-cover"
          priority
        />
      </div>
      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {rest.map((img, i) => (
            <div
              key={i}
              className="aspect-[16/10] rounded-lg overflow-hidden bg-surface-2"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
