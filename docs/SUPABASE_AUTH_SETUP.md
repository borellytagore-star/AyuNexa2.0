# Supabase Auth setup for AyuNexa

## What this change adds

- Email/password sign-up and sign-in using Supabase Auth.
- Persistent client sessions, session refresh, sign-out, and an app-wide auth gate.
- A `public.profiles` row created automatically for each new Auth user.
- New signups receive the `patient` role. Users cannot change their role through the client.
- The `/admin` screen and every `/api/admin/*` route require a profile explicitly assigned `super_admin`.
- Express middleware validates the Supabase access token with Auth before trusting the user's profile role.
- Row Level Security restricts profile reads/updates to the user's own profile, and updates are limited to the `display_name` column.

## Local configuration

1. Copy `.env.example` to `.env`.
2. Keep the Supabase URL and publishable key values for the configured AyuNexa project. A publishable key is safe for browser use when RLS is correctly enabled; never put a Supabase secret/service-role key in the frontend or commit it.
3. Install dependencies with `npm install`.
4. Run `npm run dev`.

The Vite app uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The Express API uses `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.

In the Supabase Dashboard, configure the site's URL and allowed redirect URLs for your local and production origins. Confirm the email-confirmation settings work with the domain where AyuNexa is hosted.

## Assigning elevated roles

Create each account through the sign-up screen first. Then use the Supabase SQL Editor as an authorized project administrator to assign the matching profile role. Change the email address to the exact account email:

```sql
-- Give a verified care-team account the Doctor portal.
update public.profiles
set role = 'doctor', updated_at = now()
where id = (select id from auth.users where email = 'doctor@example.com');

-- Give an approved caregiver the Caregiver portal.
update public.profiles
set role = 'caregiver', updated_at = now()
where id = (select id from auth.users where email = 'caregiver@example.com');

-- Assign Super Admin only to a trusted operations account.
update public.profiles
set role = 'super_admin', updated_at = now()
where id = (select id from auth.users where email = 'admin@example.com');
```

Before running an update, verify that the email resolves to exactly one account and that the account holder is authorized for the selected role. Ordinary authenticated clients cannot perform these role changes because the table grants updates only on `display_name`.

## Important scope note

This change protects sign-in, UI access, profile-role lookup, and the Operations API. The existing medicine, dose, caregiver, and care-plan screens still use the app's demo/local state and seed data. This change does **not** yet turn those records into user-partitioned, server-persisted clinical records. Before using real patient information, add server/database persistence and per-patient RLS policies for each clinical table, and verify caregiver/doctor-patient relationships on the server.
