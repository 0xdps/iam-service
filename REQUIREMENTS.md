# IAM & Auth Platform — Short Requirements

**Purpose:** Build an IAM + Auth platform with three services behind NGINX: `auth` (Go), `iam` (Node/TS), and `fe` (React). Each has its own DB (`auth-db`, `iam-db`). Redis is used for cache + revocation keys + event streams.

---

## Services

* **auth (Go)** — login, JWT access tokens (3–5m), refresh rotation, sessions, MFA, logout, revoke.
* **iam (Node/TS)** — CRUD for users/groups/roles/permissions, audit logs, authorization decisions.
* **fe (React/TS)** — login + admin console.
* **NGINX** — routes `/auth/*`, `/iam/*`, `/`.

---

## Data

* **auth-db:** users, credentials (hashed pw), sessions (refresh token hashed), mfa\_secrets.
* **iam-db:** groups, roles, permissions, memberships, assignments, audit\_logs.

---

## Tokens

* **Access token:** JWT, 3–5 min, minimal claims (`sub`, `session_id`, `exp`).
* **Refresh token:** opaque, rotated, stored hashed in sessions.
* **Revocation:** Redis keys: `revoked:session:{id}`, `revoked:user:{id}`.

---

## Redis

* **Streams:** `stream:iam.events` with events: `membership.changed`, `role.updated`, `user.blocked`, `session.revoked`.
* **Consumers:** auth (delete sessions, set revocations), iam (invalidate cache).
* **Cache:** `cache:perms:user:{id}`, TTL \~60s.

---

## APIs (minimal)

**Auth (`/auth/v1`):**

* `POST /login` → access + refresh
* `POST /token/refresh` → new access + rotated refresh
* `POST /logout`
* `POST /introspect`

**IAM (`/iam/v1`):**

* `POST /authorize { sub, session_id, action, resource }` → `{ allow }`
* CRUD: users, groups, roles, permissions

---

## Flows

* **Login:** FE → auth/login → gets JWT + refresh → stores refresh cookie.
* **Access:** FE calls IAM with JWT → verify signature → check `revoked:*` → IAM authorize.
* **Permission change / block:** IAM updates DB + XADD event → consumers revoke sessions or invalidate cache.
* **Forced re-login:** auth sets `revoked:session` in Redis, sessions table revoked.

---

## Security

* Password hashing: Argon2
* TLS via NGINX
* Rate-limit login & refresh endpoints
* Audit all IAM admin actions

---
