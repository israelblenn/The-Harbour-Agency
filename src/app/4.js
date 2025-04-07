'use client';
import { useState } from 'react';

export default function Home() {
  const [hoveredPanel, setHoveredPanel] = useState(null);
  const totalPanels = 100;

  return (
    <main>
      <h1>Expanding Grid Layout</h1>
      <div className="grid-container">
        {Array.from({ length: totalPanels }).map((_, index) => (
          <div 
            key={index}
            className={`panel ${hoveredPanel === index ? 'expanded' : ''}`}
            onMouseEnter={() => setHoveredPanel(index)}
            onMouseLeave={() => setHoveredPanel(null)}
            style={{
              // When expanded, make the panel span 3x3 cells
              gridRow: hoveredPanel === index ? `span 3` : 'auto',
              gridColumn: hoveredPanel === index ? `span 3` : 'auto',
            }}
          >
            <div className="panel-content">
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        main {
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        h1 {
          text-align: center;
          margin-bottom: 2rem;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .grid-container {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 8px;
          width: 100%;
          position: relative;
        }

        .panel {
          position: relative;
          background-color: #f0f0f0;
          border-radius: 6px;
          transition: all 0.3s ease;
          color: #333;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        /* Make panels square */
        .panel:before {
          content: '';
          display: block;
          padding-top: 100%; /* Creates a 1:1 aspect ratio */
        }

        .panel-content {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1rem;
        }

        .panel.expanded {
          z-index: 10;
          background-color: #e0e0ff;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }

        .panel.expanded .panel-content {
          font-size: 2rem;
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .grid-container {
            grid-template-columns: repeat(8, 1fr);
          }
        }

        @media (max-width: 768px) {
          .grid-container {
            grid-template-columns: repeat(6, 1fr);
          }
        }

        @media (max-width: 480px) {
          .grid-container {
            grid-template-columns: repeat(4, 1fr);
          }
          
          .panel.expanded {
            grid-row: span 2 !important;
            grid-column: span 2 !important;
          }
        }
      `}</style>
    </main>
  );
}