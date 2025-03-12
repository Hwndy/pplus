import React from 'react';

const SwotAnalysis = () => {
    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">SWOT Analysis</h1>
                <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                    <i className="fas fa-download fa-sm text-white-50"></i> Export Analysis
                </a>
            </div>

            <div className="row">
                <div className="col-lg-6 mb-4">
                    <div className="card bg-primary text-white shadow">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold">Strengths</h6>
                        </div>
                        <div className="card-body">
                            <ul className="list-unstyled mb-0">
                                <li className="mb-2">Strong brand recognition</li>
                                <li className="mb-2">Positive media coverage</li>
                                <li className="mb-2">High engagement rates</li>
                                <li className="mb-2">Effective PR campaigns</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6 mb-4">
                    <div className="card bg-warning text-white shadow">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold">Weaknesses</h6>
                        </div>
                        <div className="card-body">
                            <ul className="list-unstyled mb-0">
                                <li className="mb-2">Limited social media presence</li>
                                <li className="mb-2">Regional market focus</li>
                                <li className="mb-2">Resource constraints</li>
                                <li className="mb-2">Communication gaps</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6 mb-4">
                    <div className="card bg-success text-white shadow">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold">Opportunities</h6>
                        </div>
                        <div className="card-body">
                            <ul className="list-unstyled mb-0">
                                <li className="mb-2">Emerging markets</li>
                                <li className="mb-2">Digital transformation</li>
                                <li className="mb-2">Strategic partnerships</li>
                                <li className="mb-2">Content marketing</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6 mb-4">
                    <div className="card bg-danger text-white shadow">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold">Threats</h6>
                        </div>
                        <div className="card-body">
                            <ul className="list-unstyled mb-0">
                                <li className="mb-2">Competitive pressure</li>
                                <li className="mb-2">Market volatility</li>
                                <li className="mb-2">Regulatory changes</li>
                                <li className="mb-2">Reputation risks</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-12 mb-4">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Analysis Summary</h6>
                        </div>
                        <div className="card-body">
                            <p>Comprehensive analysis of the organization's current position in the market, highlighting key areas of focus and potential growth opportunities.</p>
                            <p className="mb-0">Recommendations for leveraging strengths and opportunities while addressing weaknesses and mitigating threats.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SwotAnalysis;