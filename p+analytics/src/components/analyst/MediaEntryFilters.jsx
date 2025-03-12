import React from 'react';
import { Card } from '../common/Card';
import FormField from '../common/FormField';

const MediaEntryFilters = ({ filters, onFilterChange }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange({ ...filters, [name]: value });
    };

    return (
        <Card 
            title="Filters" 
            collapsible 
            defaultCollapsed={true}
            className="mb-4"
        >
            <div className="row">
                <div className="col-md-4">
                    <FormField
                        type="select"
                        label="Brand"
                        name="brand"
                        value={filters.brand || ''}
                        onChange={handleChange}
                        options={[
                            { value: '', label: 'All Brands' },
                            { value: 'Stanbic IBTC Bank', label: 'Stanbic IBTC Bank' },
                            { value: 'Stanbic IBTC Capital', label: 'Stanbic IBTC Capital' },
                            { value: 'Stanbic IBTC Insurance', label: 'Stanbic IBTC Insurance' }
                        ]}
                    />
                </div>
                <div className="col-md-4">
                    <FormField
                        type="select"
                        label="Media Type"
                        name="media_type"
                        value={filters.media_type || ''}
                        onChange={handleChange}
                        options={[
                            { value: '', label: 'All Types' },
                            { value: 'Print', label: 'Print' },
                            { value: 'Online', label: 'Online' }
                        ]}
                    />
                </div>
                <div className="col-md-4">
                    <FormField
                        type="select"
                        label="Sentiment"
                        name="sentiment"
                        value={filters.sentiment || ''}
                        onChange={handleChange}
                        options={[
                            { value: '', label: 'All Sentiments' },
                            { value: 'positive', label: 'Positive' },
                            { value: 'negative', label: 'Negative' },
                            { value: 'neutral', label: 'Neutral' }
                        ]}
                    />
                </div>
            </div>
        </Card>
    );
};

export default MediaEntryFilters;