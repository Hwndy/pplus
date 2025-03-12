import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
    const spinnerSize = {
        sm: 'spinner-border-sm',
        md: '',
        lg: 'spinner-border-lg'
    };

    return (
        <div className="d-flex justify-content-center align-items-center p-3">
            <div className={`spinner-border text-${color} ${spinnerSize[size]}`} role="status">
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
};

LoadingSpinner.propTypes = {
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    color: PropTypes.string
};

export default LoadingSpinner;