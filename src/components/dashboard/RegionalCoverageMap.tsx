import React from 'react';

interface RegionalCoverage {
  country: string;
  frequency: 'high' | 'low';
}

interface RegionalCoverageMapProps {
  regions: RegionalCoverage[];
}

export function RegionalCoverageMap({ regions }: RegionalCoverageMapProps) {
  // This is a simplified placeholder for a real map component
  // In a real implementation, you would use a proper map library like react-simple-maps or similar
  
  return (
    <div className="h-full border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Online Coverage by Region</h3>
      
      {/* Placeholder for the map */}
      <div className="h-80 bg-muted/20 rounded-lg flex items-center justify-center mb-4 relative">
        {/* World map outline - very simplified */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="80%" height="80%" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
            {/* Very simplified world map outline */}
            <path 
              d="M150,250 C200,200 250,150 350,150 C450,150 500,200 550,250 C600,300 650,350 750,350 C850,350 900,300 950,250" 
              stroke="#ccc" 
              strokeWidth="2" 
              fill="none" 
            />
            
            {/* Africa - simplified */}
            <path 
              d="M500,200 C520,220 540,240 550,300 C560,360 550,380 530,400 C510,420 490,430 470,420 C450,410 440,390 430,370 C420,350 410,330 420,310 C430,290 450,270 470,250 C490,230 480,210 500,200" 
              stroke="#ccc" 
              strokeWidth="2" 
              fill="#e0e0e0" 
            />
            
            {/* Nigeria - highlighted */}
            <circle 
              cx="470" 
              cy="320" 
              r="15" 
              fill="#0066cc" 
              stroke="#fff" 
              strokeWidth="2" 
            />
            
            {/* USA - low frequency */}
            <circle 
              cx="250" 
              cy="220" 
              r="10" 
              fill="#cce5ff" 
              stroke="#fff" 
              strokeWidth="2" 
            />
            
            {/* Brazil - low frequency */}
            <circle 
              cx="350" 
              cy="350" 
              r="10" 
              fill="#cce5ff" 
              stroke="#fff" 
              strokeWidth="2" 
            />
            
            {/* Turkey - low frequency */}
            <circle 
              cx="550" 
              cy="230" 
              r="10" 
              fill="#cce5ff" 
              stroke="#fff" 
              strokeWidth="2" 
            />
          </svg>
        </div>
        
        <p className="text-muted-foreground z-10">Regional Coverage Map</p>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-600 rounded-sm mr-2"></div>
          <span className="text-sm">High Frequency</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-200 rounded-sm mr-2"></div>
          <span className="text-sm">Low Frequency</span>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-sm font-semibold mb-2">Countries:</p>
        <div className="flex flex-wrap gap-2">
          {regions.map((region, index) => (
            <div 
              key={index} 
              className={`px-2 py-1 rounded-md text-xs ${
                region.frequency === 'high' ? 'bg-blue-600 text-white' : 'bg-blue-200 text-blue-800'
              }`}
            >
              {region.country}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
