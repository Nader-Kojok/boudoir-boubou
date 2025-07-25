import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Expand } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import Image from "next/image"

export interface ImageGalleryProps {
  images: string[]
  alt?: string
  className?: string
  showThumbnails?: boolean
  showControls?: boolean
  showExpandButton?: boolean
  autoplay?: boolean
  loop?: boolean
  onImageClick?: (index: number) => void
  onExpand?: (images: string[], currentIndex: number) => void
}

export function ImageGallery({
  images,
  alt = "Image",
  className,
  showThumbnails = false,
  showControls = true,
  showExpandButton = false,
  autoplay = false,
  loop = true,
  onImageClick,
  onExpand,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop,
    ...(autoplay && { 
      delay: 4000,
      stopOnInteraction: false 
    })
  })
  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  })

  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])



  const onSelect = React.useCallback(() => {
    if (!emblaApi || !thumbsApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    thumbsApi.scrollTo(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi, thumbsApi])

  React.useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
  }, [emblaApi, onSelect])

  const handleImageClick = (index: number) => {
    onImageClick?.(index)
  }

  const handleExpand = () => {
    onExpand?.(images, selectedIndex)
  }

  if (!images || images.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted rounded-lg aspect-square",
        className
      )}>
        <span className="text-muted-foreground text-sm">Aucune image</span>
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className={cn("relative group", className)}>
        {images[0].startsWith('data:') ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[0]}
            alt={alt}
            className="w-full h-full object-cover rounded-lg cursor-pointer"
            onClick={() => handleImageClick(0)}
          />
        ) : (
          <Image
            src={images[0]}
            alt={alt}
            width={500}
            height={500}
            className="w-full h-full object-cover rounded-lg cursor-pointer"
            onClick={() => handleImageClick(0)}
          />
        )}
        {showExpandButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleExpand}
          >
            <Expand className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Main carousel */}
      <div className="relative group">
        <div className="overflow-hidden rounded-lg" ref={emblaRef}>
          <div className="flex">
            {images.map((image, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0">
                {image.startsWith('data:') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={`${alt} ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handleImageClick(index)}
                  />
                ) : (
                  <Image
                    src={image}
                    alt={`${alt} ${index + 1}`}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handleImageClick(index)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation controls */}
        {showControls && images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity",
                !canScrollPrev && "opacity-50 cursor-not-allowed"
              )}
              onClick={scrollPrev}
              disabled={!canScrollPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity",
                !canScrollNext && "opacity-50 cursor-not-allowed"
              )}
              onClick={scrollNext}
              disabled={!canScrollNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Expand button */}
        {showExpandButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleExpand}
          >
            <Expand className="h-4 w-4" />
          </Button>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="overflow-hidden" ref={thumbsRef}>
          <div className="flex gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                className={cn(
                  "flex-[0_0_auto] w-16 h-16 rounded border-2 overflow-hidden transition-all",
                  index === selectedIndex
                    ? "border-primary"
                    : "border-transparent hover:border-muted-foreground"
                )}
                onClick={() => emblaApi?.scrollTo(index)}
              >
                {image.startsWith('data:') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={`${alt} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={image}
                    alt={`${alt} thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageGallery