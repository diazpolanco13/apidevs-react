import createImageUrlBuilder from '@sanity/image-url'
import type { Image } from 'sanity'

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

export const urlForImage = (source: any) => {
  if (!source?.asset) {
    return undefined
  }

  // Si el asset ya está resuelto (tiene url), úsalo directamente
  if (source.asset.url) {
    return {
      url: () => source.asset.url,
      width: (w: number) => ({
        height: (h: number) => ({
          url: () => source.asset.url
        })
      })
    }
  }

  // Si tiene _ref, usa el builder normal
  if (source.asset._ref) {
    return imageBuilder?.image(source).auto('format').fit('max')
  }

  return undefined
}

export function resolveOpenGraphImage(image: Image | undefined, width = 1200, height = 627) {
  if (!image) return undefined
  const imageBuilder = urlForImage(image)?.width(width).height(height);
  const url = (imageBuilder as any)?.fit('crop').url();
  if (!url) return undefined
  return { url, alt: image?.alt as string | undefined, width, height }
}
