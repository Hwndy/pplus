import React, { useState } from 'react';
import { Card } from '../common/Card';
import DateRangePicker from '../common/DateRangePicker';
import { useApi } from '../../hooks/useApi';
import { formatNumber, formatPercentage } from '../../utils/formatters';
import MediaEntryChart from './MediaEntryChart';

const MediaEntryReport = () => {
    const { handleRequest, loading } = useApi();
    const [reportData, setReportData] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: new Date()
    });

    const generateReport = async () => {
        try {
            const data = await handleRequest(() => 
                fetch(`/api/media-entries/report?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
            );
            setReportData(data);
        } catch (error) {
            console.error('Error generating report:', error);
        }
    };

    return (
        <div className="row">
            <div className="col-12 mb-4">
                <Card title="Media Analysis Report">
                    <div className="row align-items-center mb-4">
                        <div className="col-md-8">
                            <DateRangePicker
                                startDate={dateRange.startDate}
                                endDate={dateRange.endDate}
                                onChange={setDateRange}
                            />
                        </div>
                        <div className="col-md-4 text-right">
                            <button
                                className="btn btn-primary"
                                onClick={generateReport}
                                disabled={loading}
                            >
                                Generate Report
                            </button>
                        </div>
                    </div>

                    {reportData && (
                        <>
                            <div className="row mb-4">
                                <div className="col-md-3">
                                    <div className="card border-left-primary">
                                        <div className="card-body">
                                            <h6>Total Entries</h6>
                                            <h4>{formatNumber(reportData.totalEntries)}</h4>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card border-left-success">
                                        <div className="card-body">
                                            <h6>Positive Sentiment</h6>
                                            <h4>{formatPercentage(reportData.positiveSentimentRatio)}</h4>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card border-left-info">
                                        <div className="card-body">
                                            <h6>Total Reach</h6>
                                            <h4>{formatNumber(reportData.totalReach)}</h4>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card border-left-warning">
                                        <div className="card-body">
                                            <h6>Media Value</h6>
                                            <h4>₦{formatNumber(reportData.totalMediaValue)}</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <MediaEntryChart
                                        data={reportData.entries}
                                        type="sentiment"
                                        title="Sentiment Distribution"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <MediaEntryChart
                                        data={reportData.entries}
                                        type="mediaType"
                                        title="Media Type Distribution"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default MediaEntryReport;