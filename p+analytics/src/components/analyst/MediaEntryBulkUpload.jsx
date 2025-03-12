import React, { useState } from 'react';
import { Card } from '../common/Card';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../context/NotificationContext';
import { validateMediaEntry } from '../../utils/mediaEntryValidation';
import * as XLSX from 'xlsx';

const MediaEntryBulkUpload = ({ onUploadComplete }) => {
    const { handleRequest, loading } = useApi();
    const { addNotification } = useNotification();
    const [validationErrors, setValidationErrors] = useState([]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const workbook = XLSX.read(event.target.result, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(worksheet);

                const errors = [];
                const validEntries = [];

                data.forEach((entry, index) => {
                    const validationResult = validateMediaEntry(entry);
                    if (Object.keys(validationResult).length > 0) {
                        errors.push({
                            row: index + 2,
                            errors: validationResult
                        });
                    } else {
                        validEntries.push(entry);
                    }
                });

                if (errors.length > 0) {
                    setValidationErrors(errors);
                    addNotification(`Found ${errors.length} invalid entries`, 'warning');
                    return;
                }

                await handleRequest(() => 
                    fetch('/api/media-entries/bulk', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ entries: validEntries })
                    })
                );

                addNotification(`Successfully uploaded ${validEntries.length} entries`, 'success');
                onUploadComplete();
                setValidationErrors([]);
            } catch (error) {
                addNotification('Error processing file', 'error');
            }
        };

        reader.readAsBinaryString(file);
    };

    return (
        <Card title="Bulk Upload">
            <div className="form-group">
                <label>Upload Excel File</label>
                <input
                    type="file"
                    className="form-control-file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={loading}
                />
                <small className="text-muted">
                    Please upload an Excel file with the required columns
                </small>
            </div>

            {validationErrors.length > 0 && (
                <div className="alert alert-warning mt-3">
                    <h6>Validation Errors:</h6>
                    <ul className="mb-0">
                        {validationErrors.map((error, index) => (
                            <li key={index}>
                                Row {error.row}: {Object.values(error.errors).join(', ')}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {loading && (
                <div className="text-center mt-3">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default MediaEntryBulkUpload;