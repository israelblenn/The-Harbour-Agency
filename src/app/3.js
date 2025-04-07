'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  // Array of numbers
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
  
  // State to track the starting index for the visible items
  const [startIndex, setStartIndex] = useState(0);
  
  const leftBoxesRef = useRef(numbers.map(() => null));
  const rightBoxRef = useRef(null);
  const listContainerRef = useRef(null);
  const firstListItemRef = useRef(null);
  
  // Initialize polygon points for connections
  const [polygonPoints, setPolygonPoints] = useState({
    listToLeftBox: "",
    leftToRight: Array(numbers.length).fill("")
  });

  // Store box dimensions
  const boxDimensions = { 
    left: { width: 110, height: 70 },
    right: { width: 150, height: 200 }
  };

  // Function to get the visible items (always 5 items)
  const getVisibleItems = () => {
    const visibleItems = [];
    for (let i = 0; i < 5; i++) {
      // Use modulo to wrap around when we reach the end of the array
      const index = (startIndex + i) % numbers.length;
      visibleItems.push({
        position: i + 1, // Position in the list (1-5)
        value: numbers[index], // The actual value from the array
        originalIndex: index // Keep track of the original index in the array
      });
    }
    return visibleItems;
  };

  // Handle scroll events
  const handleScroll = (e) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      // Scrolling down - move forward in the array
      setStartIndex((prevIndex) => (prevIndex + 1) % numbers.length);
    } else if (e.deltaY < 0) {
      // Scrolling up - move backward in the array
      setStartIndex((prevIndex) => (prevIndex - 1 + numbers.length) % numbers.length);
    }
  };

  useEffect(() => {
    // Calculate polygon points connecting boxes
    function updatePolygons() {
      if (rightBoxRef.current && leftBoxesRef.current[0]) {
        const rightRect = rightBoxRef.current.getBoundingClientRect();
        
        const newLeftToRight = [];
        
        const leftX = 800; // X position for left boxes
        
        // Calculate total height of all left boxes including gaps
        const totalLeftHeight = numbers.length * boxDimensions.left.height + (numbers.length - 1) * 10; // 10px gap between boxes
        
        // Calculate starting Y position to center the left stack vertically
        const leftStartY = (window.innerHeight - totalLeftHeight) / 2;
        
        numbers.forEach((_, index) => {
          // Position each left box stacked vertically
          const leftBoxY = leftStartY + index * (boxDimensions.left.height + 10);
          
          if (leftBoxesRef.current[index]) {
            // Position the left box
            leftBoxesRef.current[index].style.top = `${leftBoxY}px`;
            leftBoxesRef.current[index].style.left = `${leftX}px`;
          
            // Get the position of each left box
            const leftRect = {
              left: leftX,
              right: leftX + boxDimensions.left.width,
              top: leftBoxY,
              bottom: leftBoxY + boxDimensions.left.height
            };
            
            // Polygon (left box to right)
            const leftTopRight = { x: leftRect.right, y: leftRect.top };
            const leftBottomRight = { x: leftRect.right, y: leftRect.bottom };
            const rightTopLeft = { x: rightRect.left, y: rightRect.top };
            const rightBottomLeft = { x: rightRect.left, y: rightRect.bottom };
            
            const polygon = `
              ${leftTopRight.x},${leftTopRight.y} 
              ${leftBottomRight.x},${leftBottomRight.y} 
              ${rightBottomLeft.x},${rightBottomLeft.y} 
              ${rightTopLeft.x},${rightTopLeft.y}
            `;
            
            newLeftToRight[index] = polygon;
          }
        });
        
        // Create connection between first list item and corresponding left box
        if (firstListItemRef.current) {
          // Get the first visible item's value
          const firstVisibleValue = numbers[startIndex];
          
          // Find the matching left box index
          const matchingBoxIndex = numbers.findIndex(num => num === firstVisibleValue);
          
          if (matchingBoxIndex !== -1 && leftBoxesRef.current[matchingBoxIndex]) {
            const listItemRect = firstListItemRef.current.getBoundingClientRect();
            const leftBoxRect = leftBoxesRef.current[matchingBoxIndex].getBoundingClientRect();
            
            // Create polygon points for the connection
            const listItemTopRight = { x: listItemRect.right, y: listItemRect.top };
            const listItemBottomRight = { x: listItemRect.right, y: listItemRect.bottom };
            const leftBoxTopLeft = { x: leftBoxRect.left, y: leftBoxRect.top };
            const leftBoxBottomLeft = { x: leftBoxRect.left, y: leftBoxRect.bottom };
            
            const connectionPolygon = `
              ${listItemTopRight.x},${listItemTopRight.y} 
              ${listItemBottomRight.x},${listItemBottomRight.y} 
              ${leftBoxBottomLeft.x},${leftBoxBottomLeft.y} 
              ${leftBoxTopLeft.x},${leftBoxTopLeft.y}
            `;
            
            setPolygonPoints(prev => ({
              ...prev,
              listToLeftBox: connectionPolygon
            }));
          }
        }
        
        setPolygonPoints(prev => ({
          ...prev,
          leftToRight: newLeftToRight
        }));
      }
    }

    // Initial update and window resize handler
    updatePolygons();
    
    // Set a small delay for the initial render to ensure all elements are positioned
    const initialRenderTimer = setTimeout(() => {
      updatePolygons();
    }, 100);
    
    const handleResize = () => {
      updatePolygons();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Add the scroll event listener to the list container
    const listContainer = listContainerRef.current;
    if (listContainer) {
      listContainer.addEventListener('wheel', handleScroll, { passive: false });
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(initialRenderTimer);
      
      if (listContainer) {
        listContainer.removeEventListener('wheel', handleScroll);
      }
    };
  }, [numbers.length, startIndex]); // Added startIndex as dependency to update connections when scrolling
  
  const visibleItems = getVisibleItems();
  
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* SVG layer for the polygons */}
      <svg style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        {/* Connection from first list item to matching left box */}
        <polygon
          points={polygonPoints.listToLeftBox}
          fill="#fff"
          stroke="#4a90e2" // Highlight color for the connection
          strokeWidth="2"
          strokeDasharray="5,5" // Dashed line to distinguish this connection
        />
        
        {/* Connections from left boxes to right */}
        {numbers.map((_, index) => (
          <polygon
            key={`left-to-right-${index}`}
            points={polygonPoints.leftToRight[index]}
            fill="#fff"
            stroke="#e0e0e0"
            strokeWidth="1.5"
          />
        ))}
      </svg>
      
      {/* activator box */}
      <div
        style={{
          background: 'rgba(150, 0, 0, 0.2)',
          position: 'absolute',
          top: 50,
          left: 100,
          zIndex: 2,
          width: 100,
          height: 20,
        }}
      />

      {/* unordered list - always shows 5 items */}
      <div 
        ref={listContainerRef}
        style={{
          position: 'absolute',
          top: 50,
          left: 100,
          zIndex: 1,
          width: 150, // Increased width for better readability
          height: 'auto',
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)', // Add subtle shadow for better UI
          borderRadius: '4px', // Rounded corners
        }}
        aria-label="Scrollable number list"
        tabIndex={0} // Make the container focusable for accessibility
        role="list" // Semantic role for accessibility
      >
        <ul 
          style={{
            listStyleType: 'none',
            padding: 0,
            margin: 0,
          }}
          aria-label="Source items"
        >
          {visibleItems.map((item, idx) => (
            <li 
              key={`list-item-${item.position}`}
              ref={idx === 0 ? firstListItemRef : null} // Reference the first list item
              style={{ 
                border: '1px solid #ccc', 
                backgroundColor: idx === 0 ? '#f0f7ff' : '#fff', // Highlight first item
                padding: '10px',
                marginBottom: '4px',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                transition: 'all 0.2s ease-out',
                borderLeft: idx === 0 ? '4px solid #4a90e2' : '1px solid #ccc', // Highlight first item
                borderRadius: '2px',
                color: 'red'
              }}
              tabIndex={0} 
              role="button"
              aria-label={`Item ${item.position}: ${item.value}`}
            >
              <span style={{ 
                marginRight: '10px', 
                fontWeight: 'bold',
                color: idx === 0 ? '#4a90e2' : '#666'
              }}>{item.position}:</span> {item.value}
            </li>
          ))}
        </ul>
      </div>

      {/* Left boxes for each number - vertically stacked */}
      {numbers.map((number, index) => {
        // Check if this number is the one in the first list item
        const isConnectedToFirstItem = number === numbers[startIndex];
        
        return (
          <div 
            key={`left-box-${number}`}
            ref={el => leftBoxesRef.current[index] = el}
            style={{
              position: 'absolute',
              width: `${boxDimensions.left.width}px`,
              height: `${boxDimensions.left.height}px`,
              background: isConnectedToFirstItem ? '#f0f7ff' : '#fff',
              zIndex: 1,
              border: isConnectedToFirstItem ? '2px solid #4a90e2' : '1px solid #ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isConnectedToFirstItem ? '0 0 8px rgba(74,144,226,0.3)' : 'none',
              borderRadius: '4px',
              transition: 'all 0.2s ease-out',
            }}
            aria-label={`Left box ${number}${isConnectedToFirstItem ? ' (connected to first list item)' : ''}`}
          >
            {number}
          </div>
        );
      })}
      
      {/* Right box (last in chain, fixed position) */}
      <div 
        ref={rightBoxRef}
        style={{
          position: 'absolute',
          width: `${boxDimensions.right.width}px`,
          height: `${boxDimensions.right.height}px`,
          background: '#fff',
          top: 250,
          left: 1500,
          zIndex: 1,
          border: '1px solid #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
        aria-label="Result container"
      >
        Result
      </div>
    </div>
  );
}