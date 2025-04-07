import { getImagesFromPublicFolder } from '@/utils/imageUtils';
import ImageGrid from '@/components/ImageGrid';
import { Suspense } from 'react';

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(9)].map((_, i) => (
        <div 
          key={i} 
          className="bg-gray-200 animate-pulse rounded-md"
          style={{ height: `${Math.floor(Math.random() * 200) + 200}px` }}
        />
      ))}
    </div>
  );
}

export default function GalleryPage() {
  const images = getImagesFromPublicFolder();
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Image Gallery</h1>
      <Suspense fallback={<LoadingGrid />}>
        <ImageGrid images={images} />
      </Suspense>
    </main>
  );
}