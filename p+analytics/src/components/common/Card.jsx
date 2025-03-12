import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ 
    children, 
    title, 
    subtitle,
    className = '',
    headerAction,
    collapsible = false,
    defaultCollapsed = false
}) => {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

    return (
        <div className={`card shadow ${className}`}>
            {(title || headerAction) && (
                <div className="card-header py-3 d-flex justify-content-between align-items-center">
                    <div>
                        {title && (
                            <h6 className="m-0 font-weight-bold text-primary">
                                {title}
                                {collapsible && (
                                    <button
                                        className="btn btn-link ml-2 p-0"
                                        onClick={() => setIsCollapsed(!isCollapsed)}
                                    >
                                        <i className={`fas fa-chevron-${isCollapsed ? 'down' : 'up'}`}></i>
                                    </button>
                                )}
                            </h6>
                        )}
                        {subtitle && <small className="text-muted">{subtitle}</small>}
                    </div>
                    {headerAction && (
                        <div className="header-action">
                            {headerAction}
                        </div>
                    )}
                </div>
            )}
            <div className={`card-body ${isCollapsed ? 'd-none' : ''}`}>
                {children}
            </div>
        </div>
    );
};

Card.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    className: PropTypes.string,
    headerAction: PropTypes.node,
    collapsible: PropTypes.bool,
    defaultCollapsed: PropTypes.bool
};

export default Card;