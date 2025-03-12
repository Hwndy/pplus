import React, { useState } from 'react';
import PropTypes from 'prop-types';

const DataTable = ({ 
    data, 
    columns, 
    sortable = false, 
    pagination = false, 
    pageSize = 10 
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

    const handleSort = (field) => {
        if (!sortable) return;

        let direction = 'asc';
        if (sortConfig.key === field && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key: field, direction });
    };

    const sortedData = React.useMemo(() => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [data, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = pagination
        ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
        : sortedData;

    return (
        <div className="table-responsive">
            <table className="table table-hover">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.field}
                                onClick={() => handleSort(column.field)}
                                style={{ cursor: sortable ? 'pointer' : 'default' }}
                            >
                                {column.header}
                                {sortable && sortConfig.key === column.field && (
                                    <i className={`fas fa-sort-${sortConfig.direction}`} />
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((row, index) => (
                        <tr key={index}>
                            {columns.map((column) => (
                                <td key={column.field}>
                                    {column.render
                                        ? column.render(row)
                                        : row[column.field]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {pagination && totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
                    </div>
                    <nav>
                        <ul className="pagination mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                            </li>
                            {[...Array(totalPages)].map((_, i) => (
                                <li
                                    key={i}
                                    className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </div>
    );
};

DataTable.propTypes = {
    data: PropTypes.array.isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            field: PropTypes.string.isRequired,
            header: PropTypes.string.isRequired,
            render: PropTypes.func
        })
    ).isRequired,
    sortable: PropTypes.bool,
    pagination: PropTypes.bool,
    pageSize: PropTypes.number
};

export default DataTable;