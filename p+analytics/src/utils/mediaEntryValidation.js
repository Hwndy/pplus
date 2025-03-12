const validateMediaEntry = (entry) => {
    const errors = {};

    if (!entry.entry_date) errors.entry_date = 'Date is required';
    if (!entry.brand) errors.brand = 'Brand is required';
    if (!entry.publication) errors.publication = 'Publication is required';
    if (!entry.title) errors.title = 'Title is required';
    if (!entry.media_type) errors.media_type = 'Media type is required';
    if (!entry.sentiment) errors.sentiment = 'Sentiment is required';

    if (entry.page_link && !isValidUrl(entry.page_link)) {
        errors.page_link = 'Invalid URL format';
    }

    if (entry.circulation && !isValidNumber(entry.circulation)) {
        errors.circulation = 'Must be a valid number';
    }

    if (entry.audience_reach && !isValidNumber(entry.audience_reach)) {
        errors.audience_reach = 'Must be a valid number';
    }

    return errors;
};

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

const isValidNumber = (value) => {
    return !isNaN(value) && Number(value) >= 0;
};

export { validateMediaEntry };