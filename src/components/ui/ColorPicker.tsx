import React, { useState, useEffect, useRef } from 'react';

interface ColorPickerProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, id, value, onChange, className }) => {
  // Ensure the initial value is a valid hex color
  const normalizeColor = (color: string): string => {
    // If not a string, use default black
    if (typeof color !== 'string') return '#000000';
    
    // If doesn't start with #, add it
    if (!color.startsWith('#')) {
      color = '#' + color;
    }
    
    // Handle 3-digit hex
    if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
      color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    }
    
    // If not a valid 6-digit hex, fallback to black
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return '#000000';
    }
    
    return color;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(normalizeColor(value));
  const pickerRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  
  // Convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Handle both 3-digit and 6-digit hex
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r: isNaN(r) ? 0 : r, g: isNaN(g) ? 0 : g, b: isNaN(b) ? 0 : b };
  };
  
  // Convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(c => {
      const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };
  
  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
    }
    
    return { 
      h: Math.round(h * 360), 
      s: Math.round(s * 100), 
      l: Math.round(l * 100) 
    };
  };
  
  // Convert HSL to RGB
  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return { 
      r: Math.round(r * 255), 
      g: Math.round(g * 255), 
      b: Math.round(b * 255) 
    };
  };
  
  // Parse the current color
  const rgb = hexToRgb(localValue);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  // Handle hue change from slider
  const handleHueChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hueRef.current) return;
    
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const hue = Math.round(x * 360);
    
    const newRgb = hslToRgb(hue, hsl.s, hsl.l);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    
    setLocalValue(newHex);
    onChange(newHex);
  };
  
  // Handle saturation and lightness change from gradient
  const handleGradientChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gradientRef.current) return;
    
    const rect = gradientRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    // X axis represents saturation (0-100%)
    // Y axis represents lightness (100-0%)
    const saturation = Math.round(x * 100);
    const lightness = Math.round(100 - y * 100);
    
    const newRgb = hslToRgb(hsl.h, saturation, lightness);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    
    setLocalValue(newHex);
    onChange(newHex);
  };
  
  // Handle RGB inputs
  const handleRgbChange = (component: 'r' | 'g' | 'b', value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;
    
    const newValue = Math.max(0, Math.min(255, numValue));
    const newRgb = { ...rgb };
    newRgb[component] = newValue;
    
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setLocalValue(newHex);
    onChange(newHex);
  };
  
  // Handle hex input
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);
    
    // Only update if it's a valid hex
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onChange(value);
    }
  };
  
  // Finalize a color selection when closing picker
  const finalizeColor = () => {
    // Make sure we apply a valid color
    const validatedColor = normalizeColor(localValue);
    setLocalValue(validatedColor);
    onChange(validatedColor);
    setIsOpen(false);
  };
  
  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        finalizeColor();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, localValue]);
  
  // Update local value when prop changes
  useEffect(() => {
    const normalizedValue = normalizeColor(value);
    if (normalizedValue !== localValue) {
      setLocalValue(normalizedValue);
    }
  }, [value]);
  
  return (
    <div className={`relative ${className || ''}`} ref={pickerRef}>
      <div className="flex items-center mt-2">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mr-3 mb-0">
          {label}
        </label>
        
        {/* Color swatch button */}
        <button
          type="button"
          className="w-8 h-8 rounded shadow border border-gray-200"
          style={{ backgroundColor: localValue }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle color picker"
        />
        
        {/* Current color text */}
        <span className="ml-2 text-xs font-mono text-gray-600">{localValue}</span>
      </div>
      
      {/* Color picker dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-white rounded-lg shadow-md border border-gray-200 w-64">
          {/* Color gradient */}
          <div className="mb-4">
            <div
              ref={gradientRef}
              className="h-32 w-full relative rounded overflow-hidden cursor-crosshair"
              onClick={handleGradientChange}
              style={{
                background: `linear-gradient(to top, 
                              rgba(0, 0, 0, 1) 0%, 
                              rgba(0, 0, 0, 0) 50%, 
                              rgba(255, 255, 255, 1) 100%), 
                            linear-gradient(to right, 
                              rgba(128, 128, 128, 1) 0%, 
                              hsla(${hsl.h}, 100%, 50%, 1) 100%)`
              }}
            >
              {/* Marker for current position */}
              <div
                className="absolute w-4 h-4 rounded-full border-2 border-white pointer-events-none"
                style={{
                  left: `${hsl.s}%`,
                  top: `${100 - hsl.l}%`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 2px rgba(0, 0, 0, 0.8)'
                }}
              />
            </div>
          </div>
          
          {/* Hue slider */}
          <div className="mb-4">
            <div
              ref={hueRef}
              className="h-6 w-full relative rounded overflow-hidden cursor-pointer"
              onClick={handleHueChange}
              style={{
                background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
              }}
            >
              {/* Marker for current hue */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white pointer-events-none"
                style={{
                  left: `${(hsl.h / 360) * 100}%`,
                  transform: 'translateX(-50%)',
                  boxShadow: '0 0 2px rgba(0, 0, 0, 0.8)'
                }}
              />
            </div>
          </div>
          
          {/* Color information */}
          <div className="mb-4">
            <div className="flex mb-2">
              <div className="w-1/2 pr-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Hex</label>
                <input
                  type="text"
                  value={localValue}
                  onChange={handleHexChange}
                  className="w-full p-1 text-xs border border-gray-300 rounded font-mono"
                />
              </div>
              <div className="w-1/2 pl-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Preview</label>
                <div
                  className="h-7 rounded border border-gray-300"
                  style={{ backgroundColor: localValue }}
                />
              </div>
            </div>
            
            {/* RGB inputs */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">R</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.r}
                  onChange={(e) => handleRgbChange('r', e.target.value)}
                  className="w-full p-1 text-xs border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">G</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.g}
                  onChange={(e) => handleRgbChange('g', e.target.value)}
                  className="w-full p-1 text-xs border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">B</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.b}
                  onChange={(e) => handleRgbChange('b', e.target.value)}
                  className="w-full p-1 text-xs border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end">
            <button
              type="button"
              className="px-3 py-1 text-xs text-gray-700 bg-gray-200 hover:bg-gray-300 rounded mr-2"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-3 py-1 text-xs text-white bg-blue-500 hover:bg-blue-600 rounded"
              onClick={finalizeColor}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker; 