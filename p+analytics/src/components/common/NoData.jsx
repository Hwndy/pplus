import React from 'react';
import PropTypes from 'prop-types';

const NoData = ({ message = 'No data available', icon = 'fa-chart-bar' }) => {
    return (
        <div className="text-center py-5">
            <i className={`fas ${icon} fa-3x text-gray-300 mb-3`}></i>
            <p className="text-gray-500 mb-0">{message}</p>
        </div>
    );
};

NoData.propTypes = {
    message: PropTypes.string,
    icon: PropTypes.string
};

export default NoData;