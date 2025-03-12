const MediaEntry = require('../models/mediaEntry');

class AnalyticsController {
    static async getMediaAnalytics(req, res) {
        try {
            const { startDate, endDate } = req.query;

            // Get CEO interviews data
            const ceoInterviews = await MediaEntry.aggregate([
                {
                    $match: {
                        entry_date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                        category: 'Interview'
                    }
                },
                {
                    $group: {
                        _id: '$company',
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        name: '$_id',
                        count: 1,
                        _id: 0
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);

            // Get partnership prominence data
            const partnershipProminence = await MediaEntry.aggregate([
                {
                    $match: {
                        entry_date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                        category: 'Partnership'
                    }
                },
                {
                    $group: {
                        _id: '$company',
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        name: '$_id',
                        count: 1,
                        _id: 0
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);

            // Get monthly trends
            const monthlyTrends = await MediaEntry.aggregate([
                {
                    $match: {
                        entry_date: { $gte: new Date(startDate), $lte: new Date(endDate) }
                    }
                },
                {
                    $group: {
                        _id: {
                            month: { $month: '$entry_date' },
                            media_type: '$media_type'
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: '$_id.month',
                        online: {
                            $sum: {
                                $cond: [{ $eq: ['$_id.media_type', 'Online'] }, '$count', 0]
                            }
                        },
                        print: {
                            $sum: {
                                $cond: [{ $eq: ['$_id.media_type', 'Print'] }, '$count', 0]
                            }
                        }
                    }
                },
                { $sort: { '_id': 1 } }
            ]);

            // Get weekly trends
            const weeklyTrends = await MediaEntry.aggregate([
                {
                    $match: {
                        entry_date: { $gte: new Date(startDate), $lte: new Date(endDate) }
                    }
                },
                {
                    $group: {
                        _id: {
                            week: { $week: '$entry_date' },
                            media_type: '$media_type'
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: '$_id.week',
                        online: {
                            $sum: {
                                $cond: [{ $eq: ['$_id.media_type', 'Online'] }, '$count', 0]
                            }
                        },
                        print: {
                            $sum: {
                                $cond: [{ $eq: ['$_id.media_type', 'Print'] }, '$count', 0]
                            }
                        }
                    }
                },
                { $sort: { '_id': 1 } },
                { $limit: 5 }
            ]);

            res.json({
                ceoInterviews,
                partnershipProminence,
                monthlyTrends,
                weeklyTrends
            });
        } catch (error) {
            res.status(500).json({ error: 'Error fetching analytics data' });
        }
    }

    static async exportAnalytics(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const data = await MediaEntry.find({
                entry_date: { $gte: new Date(startDate), $lte: new Date(endDate) }
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=media_analytics.csv');

            const csvHeader = 'Date,Company,Category,Media Type,Title,Publication\n';
            const csvRows = data.map(entry => {
                return `${entry.entry_date},${entry.company},"${entry.category}","${entry.media_type}","${entry.title}","${entry.publication}"`;
            }).join('\n');

            res.send(csvHeader + csvRows);
        } catch (error) {
            res.status(500).json({ error: 'Error exporting analytics data' });
        }
    }
}

module.exports = AnalyticsController;