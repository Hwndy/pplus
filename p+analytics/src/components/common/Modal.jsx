import React from 'react';
import PropTypes from 'prop-types';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showFooter = true,
    footerContent,
    closeButton = true
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="modal fade show" 
            style={{ display: 'block' }}
            onClick={handleBackdropClick}
        >
            <div className={`modal-dialog modal-${size}`}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        {closeButton && (
                            <button
                                type="button"
                                className="close"
                                onClick={onClose}
                                aria-label="Close"
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        )}
                    </div>
                    <div className="modal-body">
                        {children}
                    </div>
                    {showFooter && (
                        <div className="modal-footer">
                            {footerContent || (
                                <>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={onClose}
                                    >
                                        Close
                                    </button>
                                    <button type="button" className="btn btn-primary">
                                        Save Changes
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="modal-backdrop fade show"></div>
        </div>
    );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
    showFooter: PropTypes.bool,
    footerContent: PropTypes.node,
    closeButton: PropTypes.bool
};

export default Modal;