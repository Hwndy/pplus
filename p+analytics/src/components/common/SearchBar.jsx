import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';

const SearchBar = ({ onSearch, placeholder = 'Search...', delay = 500 }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearch = useCallback(
        debounce((term) => {
            onSearch(term);
        }, delay),
        [onSearch, delay]
    );

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    return (
        <div className="input-group">
            <input
                type="text"
                className="form-control bg-light border-0 small"
                placeholder={placeholder}
                value={searchTerm}
                onChange={handleChange}
            />
            <div className="input-group-append">
                <button className="btn btn-primary" type="button">
                    <i className="fas fa-search fa-sm"></i>
                </button>
            </div>
        </div>
    );
};

SearchBar.propTypes = {
    onSearch: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    delay: PropTypes.number
};

export default SearchBar;