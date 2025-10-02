import React, { useState, useEffect } from 'react';

interface CollapsibleSectionProps {
  title: string;
  icon?: string; // Font Awesome icon class
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  isExpanded?: boolean;
  onToggle?: (isExpanded: boolean) => void;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultExpanded = true,
  className = '',
  isExpanded: externalIsExpanded,
  onToggle
}) => {
  const [internalIsExpanded, setInternalIsExpanded] = useState(defaultExpanded);
  
  // Use either controlled or uncontrolled state
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;

  // Sync with external control - but only if onToggle is not provided (which means this is fully controlled)
  useEffect(() => {
    if (externalIsExpanded !== undefined && !onToggle) {
      setInternalIsExpanded(externalIsExpanded);
    }
  }, [externalIsExpanded, onToggle]);

  const toggleExpanded = () => {
    const newState = !isExpanded;
    setInternalIsExpanded(newState);
    
    // Always call onToggle if provided - this allows individual sections to be toggled
    // even when they're also controlled by the expand/collapse all button
    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <section className={`card collapsible-section ${className}`}>
      <div className="section-header collapsible-header">
        <h2 onClick={toggleExpanded} style={{ cursor: 'pointer', flex: 1 }}>
          {icon && <i className={icon}></i>}
          {title}
        </h2>
        <button 
          className="btn-toggle" 
          onClick={toggleExpanded}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
        >
          <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
        </button>
      </div>
      <div className={`collapsible-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        {children}
      </div>
    </section>
  );
};

export default CollapsibleSection;