import React from 'react';
import PropTypes from 'prop-types';

const ChartCard = ({ title, children, actions }) => {
    return (
        <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                <h6 className="m-0 font-weight-bold text-primary">{title}</h6>
                {actions && <div className="card-actions">{actions}</div>}
            </div>
            <div className="card-body">
                {children}
            </div>
        </div>
    );
};

ChartCard.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    actions: PropTypes.node
};

export default ChartCard;