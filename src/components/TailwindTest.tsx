import React from 'react';

interface TailwindTestProps {
  title?: string;
}

/**
 * A simple component to test Tailwind CSS classes
 */
export const TailwindTest: React.FC<TailwindTestProps> = ({ 
  title = 'Tailwind CSS Test'
}) => {
  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex flex-col space-y-4">
      <h2 className="text-2xl font-bold text-blue-600">{title}</h2>
      
      {/* Text utilities */}
      <div className="space-y-2">
        <p className="text-gray-800 text-lg font-semibold">Text Styles</p>
        <p className="text-red-500">This text is red</p>
        <p className="text-green-500 font-bold">This text is green and bold</p>
        <p className="text-blue-500 italic">This text is blue and italic</p>
        <p className="text-purple-500 underline">This text is purple and underlined</p>
      </div>
      
      {/* Background and border utilities */}
      <div className="space-y-2">
        <p className="text-gray-800 text-lg font-semibold">Background & Borders</p>
        <div className="bg-yellow-200 p-2 rounded">Yellow background</div>
        <div className="bg-blue-100 border-2 border-blue-500 p-2 rounded-lg">
          Blue border and light blue background
        </div>
      </div>
      
      {/* Flexbox and spacing utilities */}
      <div className="space-y-2">
        <p className="text-gray-800 text-lg font-semibold">Layout</p>
        <div className="flex space-x-4">
          <div className="bg-gray-200 p-2 rounded">Item 1</div>
          <div className="bg-gray-300 p-2 rounded">Item 2</div>
          <div className="bg-gray-400 p-2 rounded">Item 3</div>
        </div>
      </div>
      
      {/* Responsive design */}
      <div className="space-y-2">
        <p className="text-gray-800 text-lg font-semibold">Responsive</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          <div className="bg-indigo-200 p-2 rounded">Card 1</div>
          <div className="bg-indigo-300 p-2 rounded">Card 2</div>
          <div className="bg-indigo-400 p-2 rounded">Card 3</div>
        </div>
      </div>
      
      {/* Hover and focus states */}
      <div className="space-y-2">
        <p className="text-gray-800 text-lg font-semibold">Interactive</p>
        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
          Hover me
        </button>
      </div>
    </div>
  );
};

export default TailwindTest;
