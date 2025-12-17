import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📋',
  title,
  description,
  action
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '2px dashed #dee2e6'
      }}
    >
      <div
        style={{
          fontSize: '64px',
          marginBottom: '16px',
          opacity: 0.5
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          margin: '0 0 8px 0',
          fontSize: '20px',
          color: '#212529',
          fontWeight: '600'
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            margin: '0 0 24px 0',
            fontSize: '14px',
            color: '#6c757d',
            maxWidth: '400px'
          }}
        >
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: '10px 24px',
            backgroundColor: '#0d6efd',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0b5ed7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0d6efd';
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
