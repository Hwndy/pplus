import React from 'react';
import PropTypes from 'prop-types';

const Table = ({ 
    columns, 
    data, 
    className = '', 
    striped = true,
    hover = true,
    bordered = true
}) => {
    return (
        <div className="table-responsive">
            <table className={`table ${striped ? 'table-striped' : ''} 
                             ${hover ? 'table-hover' : ''} 
                             ${bordered ? 'table-bordered' : ''} 
                             ${className}`}>
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index} className={column.className || ''}>
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((column, colIndex) => (
                                <td key={colIndex} className={column.className || ''}>
                                    {column.render ? column.render(row) : row[column.field]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

Table.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            field: PropTypes.string,
            header: PropTypes.string.isRequired,
            render: PropTypes.func,
            className: PropTypes.string
        })
    ).isRequired,
    data: PropTypes.array.isRequired,
    className: PropTypes.string,
    striped: PropTypes.bool,
    hover: PropTypes.bool,
    bordered: PropTypes.bool
};

export default Table;