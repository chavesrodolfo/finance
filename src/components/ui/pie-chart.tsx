"use client";

import React from 'react';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  className?: string;
}

export function PieChart({ data, size = 200, className = "" }: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <div className="text-sm text-gray-400">No data available</div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - 20) / 2;
  const centerX = size / 2;
  const centerY = size / 2;

  let cumulativePercentage = 0;

  const createPath = (percentage: number, cumulativePercentage: number) => {
    const startAngle = cumulativePercentage * 360;
    const endAngle = startAngle + percentage * 360;
    
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArc = percentage > 0.5 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    return pathData;
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg width={size} height={size} className="overflow-visible">
        {data.map((item, index) => {
          const percentage = item.value / total;
          const path = createPath(percentage, cumulativePercentage);
          
          // Calculate text position for percentage label
          const midAngle = (cumulativePercentage + percentage / 2) * 360 - 90;
          const midAngleRad = midAngle * (Math.PI / 180);
          const textRadius = radius * 0.7; // Position text at 70% of radius
          const textX = centerX + textRadius * Math.cos(midAngleRad);
          const textY = centerY + textRadius * Math.sin(midAngleRad);
          
          cumulativePercentage += percentage;
          
          // Only show text if slice is large enough (>8% for two lines of text)
          const showText = percentage > 0.08;
          const percentageText = `${(percentage * 100).toFixed(1)}%`;
          
          return (
            <g key={index}>
              <path
                d={path}
                fill={item.color}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
                className="transition-opacity hover:opacity-80"
              />
              {showText && (
                <g>
                  {/* Account name */}
                  <text
                    x={textX}
                    y={textY - 6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white text-xs font-medium"
                    style={{ fontSize: '10px' }}
                  >
                    {item.name.length > 12 ? `${item.name.substring(0, 12)}...` : item.name}
                  </text>
                  {/* Percentage */}
                  <text
                    x={textX}
                    y={textY + 6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white text-xs font-bold"
                    style={{ fontSize: '11px' }}
                  >
                    {percentageText}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        
        {/* Center circle for donut effect */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.4}
          fill="hsl(var(--background))"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
