'use client';

import { useEffect, useRef, useState } from 'react';
import NextImage from 'next/image'; // Renamed to avoid conflict

// Target area in square pixels
const TARGET_AREA = 90000; // e.g., 300px × 300px

export default function ImageGrid({ images }) {
  const gridRef = useRef(null);
  const [packeryInstance, setPackeryInstance] = useState(null);
  const [imageDimensions, setImageDimensions] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Pre-calculate image dimensions with equal areas
  useEffect(() => {
    const loadImageDimensions = async () => {
      if (typeof window === 'undefined') return;
      
      const dimensions = await Promise.all(
        images.map((image) => {
          return new Promise((resolve) => {
            // Use the native browser Image constructor
            const img = new window.Image();
            img.src = `/images/${image}`;
            
            img.onload = () => {
              const aspectRatio = img.width / img.height;
              
              // Calculate dimensions for equal area
              const newHeight = Math.sqrt(TARGET_AREA / aspectRatio);
              const newWidth = aspectRatio * newHeight;
              
              resolve({
                src: image,
                width: newWidth,
                height: newHeight,
                aspectRatio,
                naturalWidth: img.width,
                naturalHeight: img.height
              });
            };
            
            img.onerror = () => {
              console.error(`Failed to load image: ${image}`);
              // Fallback dimensions
              resolve({
                src: image,
                width: 300,
                height: 300,
                aspectRatio: 1,
                naturalWidth: 300,
                naturalHeight: 300
              });
            };
          });
        })
      );
      
      setImageDimensions(dimensions);
    };
    
    loadImageDimensions();
  }, [images]);

  // Initialize Packery once we have image dimensions
  useEffect(() => {
    let packeryRef = null;
    
    const initializePackery = async () => {
      if (typeof window === 'undefined' || !gridRef.current || imageDimensions.length === 0) return;
      
      try {
        // Dynamically import Packery
        const Packery = (await import('packery')).default;
        const imagesLoaded = (await import('imagesloaded')).default;
        
        // Initialize Packery with specific options
        packeryRef = new Packery(gridRef.current, {
          itemSelector: '.grid-item',
          percentPosition: false, // Use pixel values
          gutter: 10,
          transitionDuration: '0.2s'
        });
        
        setPackeryInstance(packeryRef);
        
        // Layout after images are loaded
        imagesLoaded(gridRef.current).on('progress', (instance, image) => {
          // Update layout as each image loads
          packeryRef.layout();
        }).on('always', () => {
          packeryRef.layout();
          setIsLoaded(true);
        });
        
        // Handle window resize events
        const handleResize = () => {
          if (packeryRef) {
            packeryRef.layout();
          }
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (error) {
        console.error('Error initializing Packery:', error);
      }
    };

    if (imageDimensions.length > 0) {
      initializePackery();
    }

    return () => {
      if (packeryRef) {
        packeryRef.destroy();
      }
    };
  }, [imageDimensions]);

  // Calculate responsive dimensions
  const getResponsiveDimensions = (imgData) => {
    if (typeof window === 'undefined') {
      // Server-side rendering fallback
      return { width: imgData.width, height: imgData.height };
    }
    
    // Get current container width
    const containerWidth = Math.min(window.innerWidth - 40, 1200); // Account for padding
    
    // Calculate how many items can fit in a row (approximately)
    const avgItemWidth = Math.sqrt(TARGET_AREA); // Approximate average width
    const itemsPerRow = Math.max(1, Math.floor(containerWidth / (avgItemWidth + 10))); // +10 for gutter
    
    // Scale factor based on container width
    const scaleFactor = containerWidth / (itemsPerRow * avgItemWidth + (itemsPerRow - 1) * 10);
    
    // Apply scale factor to maintain equal areas
    return {
      width: Math.round(imgData.width * scaleFactor * 0.95), // 0.95 to prevent overflow
      height: Math.round(imgData.height * scaleFactor * 0.95)
    };
  };

  // Show loading skeleton
  if (imageDimensions.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-grid">
          {[...Array(9)].map((_, i) => (
            <div 
              key={i} 
              className="loading-item"
              style={{ 
                height: `${Math.floor(Math.random() * 100) + 200}px`,
                width: `${Math.floor(Math.random() * 100) + 200}px`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="packery-container">
      <div 
        ref={gridRef} 
        className={`image-grid ${isLoaded ? 'is-loaded' : ''}`}
      >
        {imageDimensions.map((imgData, index) => {
          const { width, height } = getResponsiveDimensions(imgData);
          
          return (
            <div 
              key={index} 
              className="grid-item"
              style={{
                width: `${width}px`,
                height: `${height}px`,
                opacity: isLoaded ? 1 : 0,
                transition: 'opacity 0.4s ease-in, transform 0.3s ease'
              }}
            >
              <div className="image-wrapper">
                <NextImage
                  src={`/images/${imgData.src}`}
                  alt={`Gallery image ${index + 1}`}
                  fill
                  sizes={`${width}px`}
                  style={{
                    objectFit: 'cover',
                  }}
                  priority={index < 4}
                  onLoad={() => {
                    if (packeryInstance) {
                      packeryInstance.layout();
                    }
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}