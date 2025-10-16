import React, { useState } from 'react';
import CollegeList from './CollegeList';
import '../styles/InstitutionSection.css';

const InstitutionSection = ({ institutionType, colleges, isSelected, onToggle }) => {
  const [selectedCollege, setSelectedCollege] = useState(null);

  const handleCollegeSelect = (college) => {
    setSelectedCollege(selectedCollege === college ? null : college);
  };

  return (
    <div className={`institution-card ${isSelected ? 'expanded' : ''}`}>
      <div className="institution-header" onClick={onToggle}>
        <h3>{institutionType}</h3>
        <span className="expand-icon">{isSelected ? '−' : '+'}</span>
      </div>
      
      {isSelected && (
        <CollegeList
          colleges={colleges}
          selectedCollege={selectedCollege}
          onCollegeSelect={handleCollegeSelect}
          institutionType={institutionType}
        />
      )}
    </div>
  );
};

export default InstitutionSection;