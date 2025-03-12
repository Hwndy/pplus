import React from 'react';
import PropTypes from 'prop-types';

const FormField = ({
    type = 'text',
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    touched,
    required = false,
    options = [],
    placeholder = '',
    disabled = false,
    className = '',
    rows = 3
}) => {
    const renderField = () => {
        switch (type) {
            case 'select':
                return (
                    <select
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        onBlur={onBlur}
                        className={`form-control ${error && touched ? 'is-invalid' : ''} ${className}`}
                        disabled={disabled}
                        required={required}
                    >
                        <option value="">{placeholder || 'Select...'}</option>
                        {options.map((option, index) => (
                            <option key={index} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'textarea':
                return (
                    <textarea
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        onBlur={onBlur}
                        className={`form-control ${error && touched ? 'is-invalid' : ''} ${className}`}
                        placeholder={placeholder}
                        disabled={disabled}
                        required={required}
                        rows={rows}
                    />
                );

            case 'checkbox':
                return (
                    <div className="custom-control custom-checkbox">
                        <input
                            type="checkbox"
                            name={name}
                            id={name}
                            checked={value || false}
                            onChange={onChange}
                            onBlur={onBlur}
                            className={`custom-control-input ${error && touched ? 'is-invalid' : ''} ${className}`}
                            disabled={disabled}
                            required={required}
                        />
                        <label className="custom-control-label" htmlFor={name}>
                            {label}
                        </label>
                    </div>
                );

            default:
                return (
                    <input
                        type={type}
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        onBlur={onBlur}
                        className={`form-control ${error && touched ? 'is-invalid' : ''} ${className}`}
                        placeholder={placeholder}
                        disabled={disabled}
                        required={required}
                    />
                );
        }
    };

    return (
        <div className="form-group">
            {type !== 'checkbox' && label && (
                <label htmlFor={name}>
                    {label}
                    {required && <span className="text-danger ml-1">*</span>}
                </label>
            )}
            {renderField()}
            {error && touched && (
                <div className="invalid-feedback d-block">{error}</div>
            )}
        </div>
    );
};

FormField.propTypes = {
    type: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    error: PropTypes.string,
    touched: PropTypes.bool,
    required: PropTypes.bool,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.any.isRequired,
            label: PropTypes.string.isRequired
        })
    ),
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    rows: PropTypes.number
};

export default FormField;