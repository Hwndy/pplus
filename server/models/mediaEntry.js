const db = require('../db/connection');

class MediaEntry {
    static async create(data, userId) {
        const query = `
            INSERT INTO media_entries (
                entry_date, company, industry, brand, sub_sector, 
                publication, placement, title, page_link, reporters,
                country, language, spokesperson, activity_type,
                circulation, audience_reach, media_type, online_channel,
                sentiment, media_sentiment_index, page_size, advert_spend,
                created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.entry_date,
            data.company,
            data.industry,
            data.brand,
            data.sub_sector,
            data.publication,
            data.placement,
            data.title,
            data.page_link,
            data.reporters,
            data.country,
            data.language,
            data.spokesperson,
            data.activity_type,
            data.circulation,
            data.audience_reach,
            data.media_type,
            data.online_channel,
            data.sentiment,
            data.media_sentiment_index,
            data.page_size,
            data.advert_spend,
            userId
        ];

        const [result] = await db.execute(query, values);
        return result.insertId;
    }

    static async getAll(filters = {}, page = 1, limit = 10) {
        let query = 'SELECT * FROM media_entries WHERE 1=1';
        const values = [];

        if (filters.startDate && filters.endDate) {
            query += ' AND entry_date BETWEEN ? AND ?';
            values.push(filters.startDate, filters.endDate);
        }

        if (filters.brand) {
            query += ' AND brand = ?';
            values.push(filters.brand);
        }

        if (filters.media_type) {
            query += ' AND media_type = ?';
            values.push(filters.media_type);
        }

        const offset = (page - 1) * limit;
        query += ' ORDER BY entry_date DESC LIMIT ? OFFSET ?';
        values.push(limit, offset);

        const [rows] = await db.execute(query, values);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM media_entries WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async update(id, data) {
        const query = `
            UPDATE media_entries SET
                entry_date = ?,
                company = ?,
                industry = ?,
                brand = ?,
                sub_sector = ?,
                publication = ?,
                placement = ?,
                title = ?,
                page_link = ?,
                reporters = ?,
                country = ?,
                language = ?,
                spokesperson = ?,
                activity_type = ?,
                circulation = ?,
                audience_reach = ?,
                media_type = ?,
                online_channel = ?,
                sentiment = ?,
                media_sentiment_index = ?,
                page_size = ?,
                advert_spend = ?
            WHERE id = ?
        `;

        const values = [
            data.entry_date,
            data.company,
            data.industry,
            data.brand,
            data.sub_sector,
            data.publication,
            data.placement,
            data.title,
            data.page_link,
            data.reporters,
            data.country,
            data.language,
            data.spokesperson,
            data.activity_type,
            data.circulation,
            data.audience_reach,
            data.media_type,
            data.online_channel,
            data.sentiment,
            data.media_sentiment_index,
            data.page_size,
            data.advert_spend,
            id
        ];

        const [result] = await db.execute(query, values);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.execute(
            'DELETE FROM media_entries WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = MediaEntry;