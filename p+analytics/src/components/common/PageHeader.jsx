import React from 'react';
import PropTypes from 'prop-types';

const PageHeader = ({ title, actions }) => {
    return (
        <div className="d-sm-flex align-items-center justify-content-between mb-4">
            <h1 className="h3 mb-0 text-gray-800">{title}</h1>
            {actions && (
                <div className="page-header-actions">
                    {actions}
                </div>
            )}
        </div>
    );
};

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    actions: PropTypes.node
};

export default PageHeader;