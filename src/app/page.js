'use client';
import { useState } from 'react';

export default function Home() {
  // Set your desired year range here
  const startYear = 1978;
  const endYear = 2025;
  
  // State to track hovered year
  const [hoveredYear, setHoveredYear] = useState(null);
  
  // Configuration for hover effect
  const hoverConfig = {
    mainTranslation: 150,      // px to translate the hovered year
    proximityReach: 5,         // how many years in each direction are affected
    decreaseFactor: 0.3,       // how quickly the size effect diminishes (higher = sharper falloff)
    mainScale: 3,              // scale factor for the hovered year
    baseItemHeight: 44,        // base height of each year item in px
    fontSize: 16,              // base font size in px
    
    // Rotation parameters
    maxRotation: 60,           // Maximum rotation in degrees
    rotationEasingPower: -1.5, // Negative value creates outward curve effect
    edgeStraightenFactor: 1    // Controls how quickly rotation straightens at edges (0-1)
  };
  
  // Generate years list
  const yearsList = [];
  for (let year = startYear; year <= endYear; year++) {
    yearsList.push(year);
  }

  // Configurable easing function for rotation and other effects
  const customEase = (t, power) => {
    if (power < 0) {
      // For negative power, creates a curve that rises quickly then levels off
      return Math.pow(t, Math.abs(power));
    } else if (power < 1) {
      return 1 - Math.pow(1 - t, 1/power);
    }
    return 1 - Math.pow(1 - t, power);
  };
  
  // S-curve easing function for translation
  // Creates a smooth, organic curve that eases in and out
  const sCurveEase = (t) => {
    // This creates a cubic bezier-like S-curve
    // Slow at start, faster in middle, slow at end
    return t < 0.5
      ? 4 * t * t * t  // Ease-in for first half
      : 1 - Math.pow(-2 * t + 2, 3) / 2;  // Ease-out for second half
  };
  
  // Calculate the rotation angle with edge straightening effect
  const getRotation = (relativePosition, distance) => {
    if (distance === null || distance > hoverConfig.proximityReach) return 0;
    
    // Normalize the distance
    const normalizedDistance = distance / hoverConfig.proximityReach;
    
    // Apply custom easing for outward curve
    let easeValue = customEase(normalizedDistance, hoverConfig.rotationEasingPower);
    
    // Apply edge straightening effect
    if (normalizedDistance > 0.5) {
      // Only apply straightening to the outer half of the affected area
      const straighteningFactor = hoverConfig.edgeStraightenFactor * 
        customEase((normalizedDistance - 0.5) * 2, 1.5);
      
      // Gradually reduce rotation as we approach the edge
      easeValue *= (1 - straighteningFactor);
    }
    
    // Calculate final rotation angle
    return hoverConfig.maxRotation * easeValue * Math.sign(relativePosition);
  };
  
  // Calculate the scale factor based on distance with decreaseFactor controlling the progression
  const getScaleFactor = (distance) => {
    if (distance === 0) return hoverConfig.mainScale;
    if (distance <= hoverConfig.proximityReach) {
      // Apply decreaseFactor to control size progression
      // Higher decreaseFactor = more aggressive size reduction with distance
      const sizeReduction = Math.pow(hoverConfig.decreaseFactor, distance);
      
      // Calculate scale difference between max and base
      const scaleDifference = hoverConfig.mainScale - 1;
      
      // Apply the size reduction to determine how much of that difference to keep
      return 1 + (scaleDifference * sizeReduction);
    }
    return 1;
  };

  // Calculate the translation with S-curve easing for smoother edges
  const getTranslation = (distance) => {
    if (distance === 0) return hoverConfig.mainTranslation;
    if (distance <= hoverConfig.proximityReach) {
      // Normalize the distance to a 0-1 range
      const normalizedDistance = distance / hoverConfig.proximityReach;
      
      // Apply S-curve easing to create smoother transitions at edges
      const easeValue = sCurveEase(1 - normalizedDistance);
      
      return hoverConfig.mainTranslation * easeValue;
    }
    return 0;
  };

  // Get container style (handles only size, not translation or rotation)
  const getContainerStyle = (year) => {
    let distance = null;
    
    if (hoveredYear !== null) {
      distance = Math.abs(year - hoveredYear);
    }
    
    const isAffected = distance !== null && distance <= hoverConfig.proximityReach;
    
    // Calculate scale factor
    const scaleFactor = isAffected ? getScaleFactor(distance) : 1;
    
    // Calculate actual height based on scale factor
    const heightAdjustment = hoverConfig.baseItemHeight * scaleFactor;
    
    return {
      transition: 'height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
      height: `${heightAdjustment}px`,
      display: 'flex',
      alignItems: 'center',
      opacity: hoveredYear === null || isAffected ? 1 : 0.5,
      zIndex: distance === 0 ? 10 : (isAffected ? 5 : 1),
      position: 'relative',
      cursor: 'pointer',
      marginBottom: '2px', // Small gap between items for better distinction
      width: '100%', // Ensures the container takes full width
      overflow: 'visible' // Important for allowing translated content to extend beyond container
    };
  };

  // Get translation wrapper style (handles only x-translation)
  const getTranslationWrapperStyle = (year) => {
    let distance = null;
    
    if (hoveredYear !== null) {
      distance = Math.abs(year - hoveredYear);
    }
    
    const isAffected = distance !== null && distance <= hoverConfig.proximityReach;
    
    // Calculate translation
    const translation = isAffected ? getTranslation(distance) : 0;
    
    return {
      transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      transform: `translateX(${translation.toFixed(1)}px)`, // Only translation, no rotation
      display: 'block',
      width: 'fit-content', // Allow content to determine width
      position: 'relative',
      willChange: 'transform' // Performance optimization for animations
    };
  };

  // Get content style (handles only rotation and font styling)
  const getContentStyle = (year) => {
    let distance = null;
    let relativePosition = 0;
    
    if (hoveredYear !== null) {
      distance = Math.abs(year - hoveredYear);
      relativePosition = year - hoveredYear;
    }
    
    const isAffected = distance !== null && distance <= hoverConfig.proximityReach;
    
    // Calculate scale factor for font size
    const scaleFactor = isAffected ? getScaleFactor(distance) : 1;
    
    // Calculate rotation with edge straightening effect
    const rotationAngle = isAffected ? getRotation(relativePosition, distance) : 0;
    
    // Calculate font size based on scale factor
    const fontSizeAdjustment = hoverConfig.fontSize * scaleFactor;
    
    return {
      transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), font-size 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s ease',
      transform: `rotate(${rotationAngle.toFixed(2)}deg)`, // Only rotation
      fontSize: `${fontSizeAdjustment}px`,
      fontWeight: distance === 0 ? '600' : (isAffected ? '500' : 'normal'),
      color: distance === 0 ? '#2563eb' : (isAffected ? '#4b5563' : '#6b7280'),
      transformOrigin: 'center left',
      padding: '0 16px',
      whiteSpace: 'nowrap', // Prevents text wrapping during rotation
      display: 'block',
      pointerEvents: 'none', // Important: makes the content "click-through"
    };
  };

  return (
    <main style={{ 
      margin: 0,
      padding: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)',
    }}>
      <header style={{
        padding: '1.5rem 2rem',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '1.75rem', 
          color: '#1e293b',
          fontWeight: '600'
        }}>
          Timeline: {startYear} to {endYear}
        </h1>
        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Hover over a year to explore
        </div>
      </header>
      
      <div style={{ 
        flex: 1,
        width: '100%',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ 
          width: '100%',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '1rem 2rem',
          perspective: '800px', // Adds depth perception for the rotation effect
        }}>
          <ul style={{ 
            listStyleType: 'none', 
            padding: '0',
            margin: '0',
            width: '100%',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            {yearsList.map((year) => (
              <li 
                key={year}
                onMouseEnter={() => setHoveredYear(year)}
                onMouseLeave={() => setHoveredYear(null)}
                style={getContainerStyle(year)}
              >
                <div style={getTranslationWrapperStyle(year)}>
                  <span style={getContentStyle(year)}>
                    {year}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}