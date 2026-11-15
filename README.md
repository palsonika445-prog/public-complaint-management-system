# Public Complaint Management System (PCMS)
## Enterprise Multi-City Civic-Technology Platform

The **Public Complaint Management System (PCMS)** is a production-grade full-stack civic technology platform designed for citizens and municipal corporations across India. It provides centralized digital governance for reporting infrastructure issues (potholes, garbage disposal, water supply leaks, broken streetlights, sewage overflow), tracking resolutions under strict Service Level Agreements (SLAs), and maintaining server-side tenant isolation between municipalities.

---

## 1. Project Overview & Architecture

- **Multi-Tenant Civic Core**: Independent municipal corporations (e.g. Indore Municipal Corporation, Navi Mumbai Municipal Corporation) operate securely on a single platform with strict tenant isolation.
- **Four Distinct Roles (RBAC)**:
  1. **Super Admin**: Platform oversight, city onboarding, city administrator management, global performance analytics, and audit logging.
  2. **City Admin**: City-scoped dashboards, department creation, staff assignment, SLA policy customization, and CSV export.
  3. **Department Staff**: Actionable department queue, on-site progress updates, resolution remarks, and evidence photograph uploads.
  4. **Citizen**: Mobile-friendly complaint submission with GPS/manual map picker, duplicate detection warnings, upvoting/support system, feedback ratings (1-5), and reopening resolved cases.
- **Anonymous Reporting**: Citizens can file sensitive civic issues without creating an account. The system generates a cryptographically salted SHA-256 tracking token displayed once.
- **Privacy Protections**: Complainant residential coordinates are automatically blurred (~100m) on public feeds and maps. Citizen phone numbers, email addresses, and internal staff notes are never exposed publicly.
- **Bilingual Localization**: Full natural English and Hindi translation across all screens using `i18next`.

---

## 2. Technology Stack

### Frontend
- **Framework**: React.js 18 with Vite
- **UI & Styling**: Bootstrap 5 + Custom Modern Civic CSS Design System
- **Icons**: Lucide Icons
- **Maps**: Leaflet & React Leaflet with OpenStreetMap tiles
- **Localization**: i18next & react-i18next (English & Hindi)
- **Charts**: Recharts
- **HTTP Client**: Axios with Bearer token interceptor
- **Routing**: React Router DOM v7

### Backend
- **Framework**: Python 3.13 with Flask (Application Factory Pattern)
- **Database ORM**: Flask-SQLAlchemy & SQLAlchemy 2.0
- **Database Migrations**: Flask-Migrate & Alembic
- **Authentication**: Flask-JWT-Extended (Role-Based Access Control)
- **Validation**: Marshmallow
- **File Storage**: Local secure filesystem storage with UUID hashing
- **Geocoding**: OpenStreetMap Nominatim with memory throttling & fallback
- **CORS**: Flask-CORS

### Database
- **Primary**: PostgreSQL (via `docker-compose.yml` or local instance)
- **Development Fallback**: SQLite (zero-config local student setup)

### Testing
- **Backend**: Pytest (covering 8 real-world scenarios, RBAC, tenant isolation, anonymous tracking)
- **Frontend**: Vitest & React Testing Library (JSDOM)

---

## 3. Prerequisites

- **Python**: 3.10+ (Tested on Python 3.13.9)
- **Node.js**: v18+ (Tested on Node v24.19.0)
- **npm**: v9+ (Tested on npm 11.17.0)
- **Docker / Docker Compose** (Optional, for PostgreSQL)

---

## 4. Folder Structure

```
pcms/
├── docker-compose.yml           # PostgreSQL container setup
├── .env.example                 # Documented environment variables template
├── .gitignore                   # Git exclusion rules
├── README.md                    # Setup and developer documentation
├── PROJECT_STATUS.md            # Implementation verification matrix
│
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask application factory & error handlers
│   │   ├── config.py            # Development, testing, and production configs
│   │   ├── extensions.py        # SQLAlchemy, JWT, Migrate, CORS extensions
│   │   ├── cli/                 # CLI commands (flask check-overdue)
│   │   ├── models/              # 16 SQLAlchemy models (City, Dept, User, Complaint...)
│   │   ├── permissions/         # @role_required & tenant isolation decorators
│   │   ├── routes/              # 11 REST API blueprints
│   │   ├── schemas/             # Marshmallow input validation schemas
│   │   └── services/            # SLA, duplicate detection, geocoding, notifications
│   ├── migrations/              # Alembic database migration scripts
│   ├── tests/                   # Pytest test suite (test_auth, test_scenarios, test_rbac)
│   ├── uploads/                 # Local directory for attachments and evidence
│   ├── pytest.ini               # Test configuration
│   ├── requirements.txt         # Python dependencies
│   ├── run.py                   # Development server entry point (port 5001)
│   └── seed.py                  # Realistic multi-city demo data seeder
│
└── frontend/
    ├── index.html               # Main HTML entry with Leaflet & Bootstrap CDN
    ├── package.json             # React dependencies and scripts
    ├── vite.config.js           # Vite dev server and /api proxy configuration
    └── src/
        ├── App.jsx              # Client-side routing with role-based guards
        ├── main.jsx             # React DOM root with Context providers
        ├── components/          # Reusable Navbar, Sidebar, MapPicker, StatusBadge...
        ├── context/             # AuthContext, NotificationContext
        ├── i18n/                # i18n configuration, en.json, hi.json
        ├── layouts/             # PublicLayout, DashboardLayout
        ├── pages/               # Public, Citizen, Staff, City Admin, Super Admin pages
        ├── services/            # Axios API client
        ├── styles/              # custom.css design system
        └── test/                # Vitest & React Testing Library tests
```

---

## 5. Environment Variables

Copy `.env.example` to `backend/.env`:

```bash
cp .env.example backend/.env
```

Key configuration variables:
- `FLASK_ENV`: `development` or `production`
- `PORT`: Backend listening port (default: `5001`)
- `SECRET_KEY`: Flask session secret
- `JWT_SECRET_KEY`: Secret key for signing JWT tokens
- `DATABASE_URL`: `postgresql://pcms_user:pcms_password@localhost:5432/pcms_db` (or omit for SQLite)
- `UPLOAD_FOLDER`: Directory to store evidence images (default: `uploads`)

---

## 6. PostgreSQL Setup (Docker or Local)

To start a local PostgreSQL container using Docker Compose:

```bash
docker-compose up -d
```

This spins up PostgreSQL 15 on port `5432` with database `pcms_db`.

*Note for students*: If Docker is not available, you can omit `DATABASE_URL` in `.env`. The backend automatically falls back to an SQLite database (`pcms.db`) with zero setup required.

---

## 7. Backend Installation & Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate    # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Initialize database and seed with demo data:
   ```bash
   python seed.py
   ```
5. (Optional) Run database migrations:
   ```bash
   export FLASK_APP=run.py
   flask db upgrade
   ```

---

## 8. Frontend Installation & Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```

---

## 9. How to Run the Applications

### Start the Backend (Port 5001)
```bash
cd backend
source venv/bin/activate
python run.py
```
Backend API will be live at: `http://127.0.0.1:5001` (Health check: `http://127.0.0.1:5001/api/health`)

### Start the Frontend (Port 3000)
In a separate terminal:
```bash
cd frontend
npm run dev
```
Frontend Web Portal will be live at: `http://localhost:3000`

---

## 10. Development Login Credentials

For testing and grading, use these pre-seeded accounts:

| Role | Email | Password | City Scope |
|------|-------|----------|------------|
| **Super Admin** | `superadmin@pcms.gov.in` | `Admin@123` | Global (All Cities) |
| **City Admin** | `admin.indore@pcms.gov.in` | `Admin@123` | Indore Municipal Corporation |
| **City Admin** | `admin.navimumbai@pcms.gov.in` | `Admin@123` | Navi Mumbai Municipal Corp |
| **Department Staff** | `pwd.staff@indore.gov.in` | `Staff@123` | Indore PWD |
| **Department Staff** | `sanitation.staff@indore.gov.in` | `Staff@123` | Indore Solid Waste Mgmt |
| **Citizen** | `citizen.rahul@example.com` | `Citizen@123` | Indore |
| **Citizen** | `citizen.priya@example.com` | `Citizen@123` | Navi Mumbai |
| **Anonymous Tracking** | Reference: `CMP-2026-000004` | Token: `DEMO-ANON-TOKEN-2026` | Navi Mumbai |

*Tip: The Login page features quick-fill buttons for instant 1-click testing of each role.*

---

## 11. Core REST API Endpoints

### Authentication
- `POST /api/auth/register` — Citizen registration
- `POST /api/auth/login` — Account authentication (returns JWT)
- `GET /api/auth/me` — Current user profile
- `PUT /api/auth/profile` — Update language preference and contact details
- `POST /api/auth/password-reset-request` — Request password reset
- `POST /api/auth/password-reset-confirm` — Confirm password reset

### Complaints & Maps
- `POST /api/complaints` — Submit complaint (authenticated citizen or anonymous)
- `GET /api/complaints/public` — Sanitized community feed
- `GET /api/complaints/public-map` — Approximate pins for Leaflet map
- `GET /api/complaints/<id>` — Complaint details (permission sanitized)
- `POST /api/complaints/anonymous-track` — Track complaint via ID + token
- `POST /api/complaints/<id>/support` — Upvote/support an existing public issue
- `POST /api/complaints/<id>/status` — Advance workflow status (Staff/Admin)
- `POST /api/complaints/<id>/assign` — Allocate to department and staff (City Admin)
- `POST /api/complaints/<id>/feedback` — Submit citizen rating and remarks
- `POST /api/complaints/<id>/reopen` — Citizen reopens resolved issue
- `POST /api/complaints/check-duplicates` — Proximity duplicate detection
- `GET /api/maps/reverse-geocode` — OSM reverse geocoding with throttling

### City Administration & Reports
- `GET /api/admin/city/dashboard` — City-specific metrics
- `POST /api/admin/city/staff` — Register department staff
- `POST /api/admin/city/sla-policies` — Configure SLA target hours
- `POST /api/admin/city/run-sla-check` — Evaluate overdue complaints
- `GET /api/reports/analytics` — Dynamic category and priority breakdown
- `GET /api/reports/export-csv` — Role-scoped CSV report download

### Super Admin
- `GET /api/admin/super/dashboard` — Global platform overview
- `POST /api/cities` — Onboard new municipal corporation
- `POST /api/admin/super/city-admins` — Appoint city administrator
- `GET /api/admin/super/audit-logs` — Administrative audit history

---

## 12. Testing & Quality Assurance

### Run Backend Pytest Suite
```bash
cd backend
source venv/bin/activate
pytest -v
```
Verifies all 9 test suites covering authentication, tenant isolation, duplicate detection, and all 8 real-world end-to-end scenarios.

### Run Frontend Vitest Suite
```bash
cd frontend
npm test
```
Verifies component rendering, translation triggers, and user workflows.

### Run SLA Overdue Check via CLI
```bash
cd backend
source venv/bin/activate
export FLASK_APP=run.py
flask check-overdue
```
In production, schedule this CLI command as a cron job every 15 minutes:
```cron
*/15 * * * * cd /path/to/pcms/backend && ./venv/bin/flask check-overdue >> /var/log/pcms-sla.log 2>&1
```

---

## 13. Production Deployment Guidelines

1. **WSGI Server**: In production, serve Flask using Gunicorn or uWSGI:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5001 run:app
   ```
2. **Reverse Proxy**: Place Nginx in front of both Gunicorn and the compiled React static files (`frontend/dist/`), handling SSL termination (Let's Encrypt).
3. **Database**: Utilize an AWS RDS PostgreSQL or managed PostgreSQL instance with regular snapshots.
4. **Static Assets**: Build the frontend bundle with `npm run build` and serve through Nginx or Amazon CloudFront.

---

## 14. License & Open Source Attribution
- Map tiles courtesy of [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors under ODbL.
- Reverse geocoding provided via OpenStreetMap Nominatim with strict throttling and client caching.
