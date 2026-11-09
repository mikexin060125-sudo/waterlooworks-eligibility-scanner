
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(20) PRIMARY KEY,
    title TEXT NOT NULL,
    eligibility_type VARCHAR(20) NOT NULL,
    reason TEXT,
    scanned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_eligibility_type
    CHECK (
        eligibility_type IN ('clear', 'review', 'restricted')
    )
);
