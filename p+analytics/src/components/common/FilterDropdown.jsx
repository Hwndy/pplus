import React, { useState } from 'react';
import PropTypes from 'prop-types';

const FilterDropdown = ({ options, onSelect, defaultValue, label }) => {
    const [selectedValue, setSelectedValue] = useState(defaultValue || '');

    const handleChange = (e) => {
        const value = e.target.value;
        setSelectedValue(value);
        onSelect(value);
    };

    return (
        <div className="dropdown mb-4">
            <label className="mr-2">{label}</label>
            <select 
                className="custom-select"
                value={selectedValue}
                onChange={handleChange}
            >
                <option value="">All</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

FilterDropdown.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired
        })
    ).isRequired,
    onSelect: PropTypes.func.isRequired,
    defaultValue: PropTypes.string,
    label: PropTypes.string.isRequired
};

export default FilterDropdown;