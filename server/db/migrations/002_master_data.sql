-- ============================================================
-- 002_master_data.sql
-- Populate master/configuration data from existing Jira issues
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Populate department_users from Jira assignees
-- ============================================================

INSERT INTO department_users (
    display_name,
    is_active,
    created_at,
    updated_at
)
SELECT DISTINCT
    TRIM(assignee) AS display_name,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM jira_issues
WHERE assignee IS NOT NULL
  AND TRIM(assignee) <> ''
  AND TRIM(assignee) <> '|'
ON CONFLICT DO NOTHING;


-- ============================================================
-- 2. Populate stakeholders from Jira stakeholder values
--    Format:
--    NAME_DEPARTMENT
-- ============================================================

INSERT INTO stakeholders (
    name,
    department,
    is_active,
    created_at,
    updated_at
)
SELECT DISTINCT
    TRIM(
        CASE
            WHEN POSITION('_' IN stakeholder) > 0
            THEN LEFT(stakeholder, POSITION('_' IN stakeholder) - 1)
            ELSE stakeholder
        END
    ) AS name,

    NULLIF(
        TRIM(
            CASE
                WHEN POSITION('_' IN stakeholder) > 0
                THEN SUBSTRING(
                    stakeholder
                    FROM POSITION('_' IN stakeholder) + 1
                )
                ELSE NULL
            END
        ),
        ''
    ) AS department,

    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM jira_issues
WHERE stakeholder IS NOT NULL
  AND TRIM(stakeholder) <> ''
ON CONFLICT DO NOTHING;


-- ============================================================
-- 3. Populate Jira statuses from existing jira_issues
-- ============================================================

INSERT INTO jira_statuses (
    jira_status_id,
    status_name,
    status_category_key,
    is_active,
    created_at,
    updated_at
)
SELECT DISTINCT
    LOWER(REGEXP_REPLACE(TRIM(status), '[^a-zA-Z0-9]+', '_', 'g'))
        AS jira_status_id,

    TRIM(status) AS status_name,

    NULL AS status_category_key,

    TRUE,

    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM jira_issues
WHERE status IS NOT NULL
  AND TRIM(status) <> ''
ON CONFLICT (jira_status_id)
DO UPDATE SET
    status_name = EXCLUDED.status_name,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;


-- ============================================================
-- 4. Create canonical status mappings
-- ============================================================

INSERT INTO status_mappings (
    jira_status_id,
    project_id,
    canonical_status,
    effective_from,
    is_active,
    created_at,
    updated_at
)
SELECT
    js.id,
    NULL,
    CASE
        WHEN LOWER(js.status_name) IN ('closed', 'close')
            THEN 'completed'

        WHEN LOWER(js.status_name) = 'ready for prod'
            THEN 'ready_for_production'

        WHEN LOWER(js.status_name) IN (
            'to do (migrated)',
            'todo',
            'open'
        )
            THEN 'todo'

        WHEN LOWER(js.status_name) IN (
            'dev in progress',
            'analysis',
            'code review'
        )
            THEN 'in_progress'

        WHEN LOWER(js.status_name) = 'backlog'
            THEN 'backlog'

        WHEN LOWER(js.status_name) = 'on hold'
            THEN 'on_hold'

        WHEN LOWER(js.status_name) = 'uat verified'
            THEN 'uat_verified'

        WHEN LOWER(js.status_name) = 'ready for uat'
            THEN 'ready_for_uat'

        WHEN LOWER(js.status_name) = 'ready for qa'
            THEN 'ready_for_qa'

        ELSE 'unmapped'
    END AS canonical_status,

    CURRENT_TIMESTAMP,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP

FROM jira_statuses js

WHERE js.is_active = TRUE

ON CONFLICT DO NOTHING;


-- ============================================================
-- 5. Standard Jira field mappings
-- ============================================================

INSERT INTO jira_field_mappings (
    mapping_key,
    jira_field_id,
    data_type,
    is_active,
    created_at,
    updated_at
)
VALUES
    ('issue_key', 'issuekey', 'text', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('summary', 'summary', 'text', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('status', 'status', 'text', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('assignee', 'assignee', 'text', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('project', 'project', 'text', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('issue_type', 'issuetype', 'text', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('priority', 'priority', 'text', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('created', 'created', 'timestamp', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('updated', 'updated', 'timestamp', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('stakeholder', 'stakeholder', 'text', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)

ON CONFLICT (mapping_key)
DO UPDATE SET
    jira_field_id = EXCLUDED.jira_field_id,
    data_type = EXCLUDED.data_type,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;


COMMIT;