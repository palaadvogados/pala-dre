DROP TABLE IF EXISTS webhook_log CASCADE;
DROP TABLE IF EXISTS dre_entries CASCADE;
DROP TABLE IF EXISTS dre_accounts CASCADE;

CREATE TABLE IF NOT EXISTS dre_accounts (
    code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    parent_code VARCHAR(20) REFERENCES dre_accounts(code),
    nature VARCHAR(20) NOT NULL,
    sign INTEGER NOT NULL DEFAULT 1,
    level INTEGER NOT NULL DEFAULT 0,
    is_total BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INTEGER NOT NULL DEFAULT 0,
    category_code VARCHAR(20),
    clickup_option_index INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dre_entries (
    id SERIAL PRIMARY KEY,
    account_code VARCHAR(20) NOT NULL REFERENCES dre_accounts(code),
    period DATE NOT NULL,
    amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    description TEXT,
    client VARCHAR(200),
    project VARCHAR(200),
    bank VARCHAR(100),
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    source VARCHAR(50) DEFAULT 'manual',
    source_id VARCHAR(100) UNIQUE,
    clickup_task_id VARCHAR(50),
    clickup_list_id VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entries_period ON dre_entries(period);
CREATE INDEX IF NOT EXISTS idx_entries_account ON dre_entries(account_code);
CREATE INDEX IF NOT EXISTS idx_entries_source_id ON dre_entries(source_id);
CREATE INDEX IF NOT EXISTS idx_entries_clickup ON dre_entries(clickup_task_id);

CREATE TABLE IF NOT EXISTS webhook_log (
    id SERIAL PRIMARY KEY,
    event VARCHAR(50) NOT NULL,
    task_id VARCHAR(50),
    list_id VARCHAR(50),
    payload JSONB,
    processed BOOLEAN DEFAULT FALSE,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
