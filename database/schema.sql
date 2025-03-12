CREATE TABLE media_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entry_date DATE NOT NULL,
    company VARCHAR(100) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    sub_sector VARCHAR(100) NOT NULL,
    publication VARCHAR(200) NOT NULL,
    placement VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    page_link VARCHAR(500),
    reporters VARCHAR(255),
    country VARCHAR(100) NOT NULL,
    language VARCHAR(50) NOT NULL,
    spokesperson VARCHAR(255),
    activity_type VARCHAR(100) NOT NULL,
    circulation INT,
    audience_reach INT,
    media_type VARCHAR(50) NOT NULL,
    online_channel VARCHAR(100),
    sentiment VARCHAR(50) NOT NULL,
    media_sentiment_index DECIMAL(3,1) NOT NULL,
    page_size VARCHAR(50),
    advert_spend DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    status VARCHAR(20) DEFAULT 'pending',
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE reference_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    value VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    UNIQUE KEY category_value (category, value)
);