import React, { useState } from 'react';

const fontSizes = [
  { label: 'XXL', className: 'h-xxl' },
  { label: 'XL', className: 'h-xl' },
  { label: 'LG', className: 'h-lg' },
  { label: 'MD', className: 'h-md' },
  { label: 'SM', className: 'h-sm' },
  { label: 'XS', className: 'h-xs' },
  { label: 'XXS', className: 'h-xxs' },
];

const FontSizeSelector: React.FC<{ onChange: (size: string) => void }> = ({ onChange }) => {
  const [selectedSize, setSelectedSize] = useState<string>('h-md');

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = event.target.value;
    setSelectedSize(newSize);
    onChange(newSize);
  };

  return (
    <select value={selectedSize} onChange={handleChange}>
      {fontSizes.map((size) => (
        <option key={size.className} value={size.className}>
          {size.label}
        </option>
      ))}
    </select>
  );
};

export default FontSizeSelector;
