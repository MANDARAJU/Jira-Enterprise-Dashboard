CREATE TABLE IF NOT EXISTS department_projects (
  id BIGSERIAL PRIMARY KEY,
  jira_project_id TEXT UNIQUE,
  project_key TEXT NOT NULL UNIQUE,
  project_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS department_projects_active_order_idx ON department_projects (is_active, display_order);

CREATE TABLE IF NOT EXISTS department_users (
  id BIGSERIAL PRIMARY KEY,
  jira_account_id TEXT UNIQUE,
  email TEXT UNIQUE,
  display_name TEXT NOT NULL,
  employee_code TEXT UNIQUE,
  department TEXT,
  manager_id BIGINT REFERENCES department_users(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS department_users_active_idx ON department_users (is_active);
CREATE INDEX IF NOT EXISTS department_users_manager_idx ON department_users (manager_id);

CREATE TABLE IF NOT EXISTS stakeholders (
  id BIGSERIAL PRIMARY KEY,
  jira_account_id TEXT UNIQUE,
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  department TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS stakeholders_active_name_idx ON stakeholders (is_active, name);

CREATE TABLE IF NOT EXISTS jira_statuses (
  id BIGSERIAL PRIMARY KEY,
  jira_status_id TEXT NOT NULL UNIQUE,
  status_name TEXT NOT NULL,
  status_category_key TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS jira_statuses_active_idx ON jira_statuses (is_active);

CREATE TABLE IF NOT EXISTS status_mappings (
  id BIGSERIAL PRIMARY KEY,
  jira_status_id BIGINT NOT NULL REFERENCES jira_statuses(id),
  project_id BIGINT REFERENCES department_projects(id),
  canonical_status TEXT NOT NULL CHECK (canonical_status IN ('backlog', 'todo', 'in_progress', 'ready_for_qa', 'ready_for_uat', 'uat_verified', 'ready_for_production', 'on_hold', 'completed', 'unmapped')),
  effective_from TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  effective_to TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS status_mappings_active_unique_idx ON status_mappings (jira_status_id, COALESCE(project_id, 0)) WHERE is_active;
CREATE INDEX IF NOT EXISTS status_mappings_canonical_status_idx ON status_mappings (canonical_status);

CREATE TABLE IF NOT EXISTS jira_field_mappings (
  id BIGSERIAL PRIMARY KEY,
  mapping_key TEXT NOT NULL UNIQUE,
  jira_field_id TEXT NOT NULL,
  data_type TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO department_projects (project_key, project_name, display_order) VALUES
  ('DATN', 'DATABASE_New', 1),
  ('EXAN2', 'Exam Analysis 2.0 (New)', 2),
  ('WSB', 'Web_Stack_Board', 3),
  ('EX15', 'Examination 1.5 (New)', 4),
  ('NSISN', 'NSIS_ADMISSIONS_1.5_New', 5),
  ('P15N', 'Payroll 1.5 (New)', 6),
  ('POR', 'MYNSPIRA 2.0', 7),
  ('NSUT', 'NSUITE (New)', 8),
  ('NBLD', 'NERP 1.0 - Building', 9),
  ('NLEAD', 'NLeader', 10),
  ('NERP10F', 'NERP_1.0_Finance(New)', 11),
  ('INVT10N', 'NERP_1.0_Inventory(New)', 12),
  ('N20', 'NAP 2.0', 13),
  ('NO', 'NSIS Ops', 14),
  ('INAPIS', 'INTEGRATIONS(APIS)', 15),
  ('CRM1', 'NAP 1.5_(NCRM_New)', 16),
  ('OQB2N', 'OQB 2.0 (New)', 17),
  ('WEB2', 'Web Applications', 18),
  ('EA', 'Engineering Academics', 19)
ON CONFLICT (project_key) DO UPDATE
SET project_name = EXCLUDED.project_name, display_order = EXCLUDED.display_order, is_active = TRUE, updated_at = CURRENT_TIMESTAMP;
