\set ON_ERROR_STOP on

\if :{?admin_email}
\else
\echo 'ERROR: admin_email is required.'
\echo 'Example: psql -v admin_email=admin@example.com -f bootstrap_admin.sql'
\quit 1
\endif

BEGIN;

SET ROLE fintrack_owner;


/*
 * Confirm that the target is an existing ACTIVE user.
 *
 * Admin accounts still go through ordinary registration and
 * email verification before they can be promoted.
 */
SELECT EXISTS (SELECT 1
               FROM identity.users
               WHERE email = lower(btrim(:'admin_email'))
                 AND status = 'ACTIVE') AS target_user_exists
\gset


\if :target_user_exists
\else
ROLLBACK;
\echo 'ERROR: No ACTIVE FinTrack user exists with that email.'
\quit 1
\endif


/*
 * Assign ROLE_ADMIN.
 *
 * assigned_by_user_id = NULL means this was an operational /
 * bootstrap assignment rather than one performed by another
 * FinTrack user.
 */
INSERT INTO identity.user_roles (user_id,
                                 role_id,
                                 assigned_at,
                                 assigned_by_user_id)
SELECT u.id,
       r.id,
       CURRENT_TIMESTAMP,
       NULL
FROM identity.users u
         JOIN identity.application_roles r
              ON r.code = 'ROLE_ADMIN'
WHERE u.email = lower(btrim(:'admin_email'))
  AND u.status = 'ACTIVE'
ON CONFLICT (user_id, role_id)
    DO NOTHING;


/*
 * Display the resulting roles before leaving the owner role.
 */
SELECT u.email,
       array_agg(
           r.code
           ORDER BY r.code
       ) AS roles
FROM identity.users u
         JOIN identity.user_roles ur
              ON ur.user_id = u.id
         JOIN identity.application_roles r
              ON r.id = ur.role_id
WHERE u.email = lower(btrim(:'admin_email'))
GROUP BY u.email;


RESET ROLE;

COMMIT;
