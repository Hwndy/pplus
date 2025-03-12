import React, { useState, useEffect } from 'react';
import { useForm } from '../../hooks/useForm';
import FormField from '../common/FormField';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../context/NotificationContext';

const MediaEntryForm = () => {
    const { handleRequest, loading } = useApi();
    const { addNotification } = useNotification();
    const [referenceData, setReferenceData] = useState({});

    const initialValues = {
        entry_date: '',
        company: 'Stanbic IBTC Holdings',
        industry: 'Financial Services',
        brand: '',
        sub_sector: '',
        publication: '',
        placement: '',
        title: '',
        page_link: '',
        reporters: '',
        country: 'Nigeria',
        language: 'English',
        spokesperson: '',
        activity_type: '',
        circulation: '',
        audience_reach: '',
        media_type: '',
        online_channel: '',
        sentiment: '',
        media_sentiment_index: '',
        page_size: '',
        advert_spend: ''
    };

    const { values, handleChange, handleBlur, errors, resetForm } = useForm(initialValues);

    useEffect(() => {
        loadReferenceData();
    }, []);

    const loadReferenceData = async () => {
        try {
            const data = await handleRequest(() => fetch('/api/reference-data'));
            setReferenceData(data);
        } catch (error) {
            console.error('Error loading reference data:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await handleRequest(() => fetch('/api/media-entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            }));
            addNotification('Entry saved successfully', 'success');
            resetForm();
        } catch (error) {
            addNotification('Error saving entry', 'error');
        }
    };

    const handleSentimentChange = (e) => {
        const sentiment = e.target.value;
        const sentimentIndex = {
            'positive': 2.0,
            'negative': -3.0,
            'neutral': 1.0
        }[sentiment] || '';

        handleChange({
            target: { name: 'sentiment', value: sentiment }
        });
        handleChange({
            target: { name: 'media_sentiment_index', value: sentimentIndex }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
                <FormField
                    type="date"
                    label="Date"
                    name="entry_date"
                    value={values.entry_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.entry_date}
                    required
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="select"
                    label="Company"
                    name="company"
                    value={values.company}
                    onChange={handleChange}
                    options={[
                        { value: 'Stanbic IBTC Holdings', label: 'Stanbic IBTC Holdings' }
                    ]}
                    required
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="select"
                    label="Brand"
                    name="brand"
                    value={values.brand}
                    onChange={handleChange}
                    options={[
                        { value: 'Stanbic IBTC Bank', label: 'Stanbic IBTC Bank' },
                        { value: 'Stanbic IBTC Capital', label: 'Stanbic IBTC Capital' },
                        { value: 'Stanbic IBTC Insurance', label: 'Stanbic IBTC Insurance' },
                        { value: 'Stanbic IBTC Asset Management', label: 'Stanbic IBTC Asset Management' }
                    ]}
                    required
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="select"
                    label="Sub-Sector"
                    name="sub_sector"
                    value={values.sub_sector}
                    onChange={handleChange}
                    options={[
                        { value: 'Commercial Banking', label: 'Commercial Banking' },
                        { value: 'Financial Services', label: 'Financial Services' },
                        { value: 'Insurance', label: 'Insurance' },
                        { value: 'Asset Management', label: 'Asset Management' },
                        { value: 'Pension', label: 'Pension' }
                    ]}
                    required
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="select"
                    label="Publication"
                    name="publication"
                    value={values.publication}
                    onChange={handleChange}
                    options={[
                        { value: 'BusinessDay', label: 'BusinessDay' },
                        { value: 'Nigerian Tribune', label: 'Nigerian Tribune' },
                        { value: 'Leadership', label: 'Leadership' },
                        { value: 'New Telegraph', label: 'New Telegraph' },
                        { value: 'The Guardian', label: 'The Guardian' }
                    ]}
                    required
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="select"
                    label="Placement"
                    name="placement"
                    value={values.placement}
                    onChange={handleChange}
                    options={[
                        { value: 'Headline', label: 'Headline' },
                        { value: 'Photo', label: 'Photo' }
                    ]}
                    required
                />
            </div>

            <div className="col-12">
                <FormField
                    type="text"
                    label="Title"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="url"
                    label="Page & Link"
                    name="page_link"
                    value={values.page_link}
                    onChange={handleChange}
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="text"
                    label="Reporters"
                    name="reporters"
                    value={values.reporters}
                    onChange={handleChange}
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="select"
                    label="Country"
                    name="country"
                    value={values.country}
                    onChange={handleChange}
                    options={[
                        { value: 'Nigeria', label: 'Nigeria' },
                        { value: 'Canada', label: 'Canada' },
                        { value: 'U.S.A', label: 'U.S.A' }
                    ]}
                    required
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="select"
                    label="Language"
                    name="language"
                    value={values.language}
                    onChange={handleChange}
                    options={[
                        { value: 'English', label: 'English' },
                        { value: 'Hausa', label: 'Hausa' },
                        { value: 'French', label: 'French' }
                    ]}
                    required
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="text"
                    label="Spokesperson"
                    name="spokesperson"
                    value={values.spokesperson}
                    onChange={handleChange}
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="select"
                    label="Activities"
                    name="activity_type"
                    value={values.activity_type}
                    onChange={handleChange}
                    options={[
                        { value: 'Innovation', label: 'Innovation' },
                        { value: 'Awards', label: 'Awards' },
                        { value: 'Corporate', label: 'Corporate' },
                        { value: 'Sponsorship', label: 'Sponsorship' },
                        { value: 'CSR/CSI', label: 'CSR/CSI' },
                        { value: 'Partnership', label: 'Partnership' },
                        { value: 'Industry Report', label: 'Industry Report' }
                    ]}
                    required
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="number"
                    label="Circulation"
                    name="circulation"
                    value={values.circulation}
                    onChange={handleChange}
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="number"
                    label="Audience Reach"
                    name="audience_reach"
                    value={values.audience_reach}
                    onChange={handleChange}
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="select"
                    label="Media Type"
                    name="media_type"
                    value={values.media_type}
                    onChange={handleChange}
                    options={[
                        { value: 'Print', label: 'Print' },
                        { value: 'Online', label: 'Online' }
                    ]}
                    required
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="select"
                    label="Online Channel"
                    name="online_channel"
                    value={values.online_channel}
                    onChange={handleChange}
                    options={[
                        { value: 'Online Newspaper', label: 'Online Newspaper' },
                        { value: 'Online News Site', label: 'Online News Site' },
                        { value: 'Financial Site', label: 'Financial Site' },
                        { value: 'Blog', label: 'Blog' },
                        { value: 'Online Broadcast', label: 'Online Broadcast' }
                    ]}
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="select"
                    label="Sentiments"
                    name="sentiment"
                    value={values.sentiment}
                    onChange={handleSentimentChange}
                    options={[
                        { value: 'positive', label: 'Positive' },
                        { value: 'negative', label: 'Negative' },
                        { value: 'neutral', label: 'Neutral' }
                    ]}
                    required
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="number"
                    label="Media Sentiment Index"
                    name="media_sentiment_index"
                    value={values.media_sentiment_index}
                    onChange={handleChange}
                    disabled
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="text"
                    label="Page Size"
                    name="page_size"
                    value={values.page_size}
                    onChange={handleChange}
                />
            </div>

            <div className="col-md-6">
                <FormField
                    type="number"
                    label="Advert Spend"
                    name="advert_spend"
                    value={values.advert_spend}
                    onChange={handleChange}
                />
            </div>

            {/* Continue with other form fields following the same pattern */}
            
            <div className="col-12 mt-4">
                <button 
                    type="submit" 
                    className="btn btn-primary me-2"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Entry'}
                </button>
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                >
                    Clear Form
                </button>
            </div>
        </form>
    );
};

export default MediaEntryForm;