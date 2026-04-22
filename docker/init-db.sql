-- Initialize PostgreSQL database for distributed test results

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    task_id VARCHAR(255) UNIQUE NOT NULL,
    worker_id VARCHAR(255) NOT NULL,
    result JSONB,
    error TEXT,
    completed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_results_session ON test_results(session_id);
CREATE INDEX IF NOT EXISTS idx_test_results_task ON test_results(task_id);
CREATE INDEX IF NOT EXISTS idx_test_results_worker ON test_results(worker_id);
CREATE INDEX IF NOT EXISTS idx_test_results_completed ON test_results(completed_at);

-- Create worker_status table for tracking worker health
CREATE TABLE IF NOT EXISTS worker_status (
    id SERIAL PRIMARY KEY,
    worker_id VARCHAR(255) UNIQUE NOT NULL,
    url VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    last_heartbeat TIMESTAMP NOT NULL,
    registered_at TIMESTAMP NOT NULL,
    capabilities JSONB,
    resources JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_worker_status_worker ON worker_status(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_status_status ON worker_status(status);
CREATE INDEX IF NOT EXISTS idx_worker_status_heartbeat ON worker_status(last_heartbeat);

-- Create test_sessions table for session management
CREATE TABLE IF NOT EXISTS test_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    config JSONB,
    status VARCHAR(50) DEFAULT 'running',
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    failed_tasks INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_sessions_session ON test_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_status ON test_sessions(status);

-- Create task_metrics table for performance tracking
CREATE TABLE IF NOT EXISTS task_metrics (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(255) UNIQUE NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    worker_id VARCHAR(255) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    duration_ms INTEGER,
    exit_code INTEGER,
    memory_usage MB,
    cpu_usage_percent,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_metrics_task ON task_metrics(task_id);
CREATE INDEX IF NOT EXISTS idx_task_metrics_session ON task_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_task_metrics_type ON task_metrics(task_type);
CREATE INDEX IF NOT EXISTS idx_task_metrics_duration ON task_metrics(duration_ms);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_worker_status_updated_at 
    BEFORE UPDATE ON worker_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_sessions_updated_at 
    BEFORE UPDATE ON test_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for session summary
CREATE OR REPLACE VIEW session_summary AS
SELECT 
    s.session_id,
    s.status,
    s.started_at,
    s.completed_at,
    s.total_tasks,
    s.completed_tasks,
    s.failed_tasks,
    COUNT(tr.id) as total_results,
    AVG(CAST(EXTRACT(EPOCH FROM (tr.completed_at - tr.created_at)) * 1000 AS INTEGER)) as avg_duration_ms,
    MIN(tr.completed_at) as first_result,
    MAX(tr.completed_at) as last_result
FROM test_sessions s
LEFT JOIN test_results tr ON s.session_id = tr.session_id
GROUP BY s.session_id, s.status, s.started_at, s.completed_at, s.total_tasks, s.completed_tasks, s.failed_tasks;

-- Create view for worker performance
CREATE OR REPLACE VIEW worker_performance AS
SELECT 
    ws.worker_id,
    ws.status,
    ws.last_heartbeat,
    COUNT(tr.id) as tasks_completed,
    AVG(CAST(EXTRACT(EPOCH FROM (tr.completed_at - tr.created_at)) * 1000 AS INTEGER)) as avg_duration_ms,
    MIN(tr.completed_at) as last_task_completed
FROM worker_status ws
LEFT JOIN test_results tr ON ws.worker_id = tr.worker_id
GROUP BY ws.worker_id, ws.status, ws.last_heartbeat;

-- Insert sample data (optional)
-- This can be removed in production
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM worker_status LIMIT 1) THEN
        INSERT INTO worker_status (worker_id, url, last_heartbeat, registered_at, capabilities, resources)
        VALUES 
            ('sample-worker-1', 'http://localhost:3002', NOW(), NOW(), '["unit", "integration"]', '{"cpu": 4, "memory": "8GB"}'),
            ('sample-worker-2', 'http://localhost:3003', NOW(), NOW(), '["e2e", "performance"]', '{"cpu": 8, "memory": "16GB"}');
    END IF;
END $$;
