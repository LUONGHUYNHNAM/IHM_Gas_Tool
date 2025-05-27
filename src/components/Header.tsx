import React from 'react';
import { Beaker } from 'lucide-react';

const Header = () => {
  return (
    <header className="mb-8 text-center">
      <div className="flex items-center justify-center mb-2">
        <Beaker className="h-8 w-8 text-indigo-600 mr-2" />
        <h1 className="text-3xl font-bold text-indigo-800">
          ISO 14912:2023 Unit Conversion Tool
        </h1>
      </div>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Convert units of gas mixture components according to ISO 14912:2023 standard
      </p>
    </header>
  );
};

export default Header;