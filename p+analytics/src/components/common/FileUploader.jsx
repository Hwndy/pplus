import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

const FileUploader = ({ 
    onFileSelect, 
    multiple = false, 
    accept = '*/*',
    maxSize = 5242880, // 5MB
    maxFiles = 5
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateFiles = (files) => {
        if (!multiple && files.length > 1) {
            setError('Only one file can be uploaded at a time');
            return false;
        }

        if (files.length > maxFiles) {
            setError(`Maximum ${maxFiles} files can be uploaded at once`);
            return false;
        }

        for (let file of files) {
            if (file.size > maxSize) {
                setError(`File ${file.name} exceeds maximum size of ${maxSize / 1048576}MB`);
                return false;
            }
        }

        setError('');
        return true;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = [...e.dataTransfer.files];
        if (validateFiles(files)) {
            onFileSelect(multiple ? files : files[0]);
        }
    };

    const handleChange = (e) => {
        const files = [...e.target.files];
        if (validateFiles(files)) {
            onFileSelect(multiple ? files : files[0]);
        }
    };

    return (
        <div className="file-uploader">
            <div
                className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                />
                <div className="upload-prompt">
                    <i className="fas fa-cloud-upload-alt fa-2x mb-2"></i>
                    <p>Drag and drop files here or click to select</p>
                    <small className="text-muted">
                        {multiple ? `Up to ${maxFiles} files` : 'Single file'} (Max {maxSize / 1048576}MB each)
                    </small>
                </div>
            </div>
            {error && (
                <div className="text-danger mt-2 small">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {error}
                </div>
            )}
        </div>
    );
};

FileUploader.propTypes = {
    onFileSelect: PropTypes.func.isRequired,
    multiple: PropTypes.bool,
    accept: PropTypes.string,
    maxSize: PropTypes.number,
    maxFiles: PropTypes.number
};

export default FileUploader;