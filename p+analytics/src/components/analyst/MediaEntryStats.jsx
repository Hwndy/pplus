import React from 'react';
import { Card } from '../common/Card';
import { formatNumber } from '../../utils/formatters';

const MediaEntryStats = ({ stats }) => {
    return (
        <div className="row">
            <div className="col-xl-3 col-md-6 mb-4">
                <Card className="border-left-primary h-100 py-2">
                    <div className="card-body">
                        <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                                <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                    Total Entries
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">
                                    {formatNumber(stats.totalEntries)}
                                </div>
                            </div>
                            <div className="col-auto">
                                <i className="fas fa-newspaper fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
                <Card className="border-left-success h-100 py-2">
                    <div className="card-body">
                        <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                                <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                    Positive Sentiment
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">
                                    {stats.positiveSentiment}%
                                </div>
                            </div>
                            <div className="col-auto">
                                <i className="fas fa-smile fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
                <Card className="border-left-info h-100 py-2">
                    <div className="card-body">
                        <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                                <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                    Total Reach
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">
                                    {formatNumber(stats.totalReach)}
                                </div>
                            </div>
                            <div className="col-auto">
                                <i className="fas fa-users fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
                <Card className="border-left-warning h-100 py-2">
                    <div className="card-body">
                        <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                                <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                    Media Value
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">
                                    ₦{formatNumber(stats.totalMediaValue)}
                                </div>
                            </div>
                            <div className="col-auto">
                                <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MediaEntryStats;