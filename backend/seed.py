import os
from datetime import datetime, timedelta
from app import create_app
from app.extensions import db
from app.models.city import City
from app.models.department import Department
from app.models.category import ComplaintCategory
from app.models.user import User
from app.models.complaint import Complaint
from app.models.assignment import ComplaintAssignment
from app.models.status_history import ComplaintStatusHistory
from app.models.attachment import ComplaintAttachment
from app.models.comment import ComplaintComment
from app.models.support import ComplaintSupport
from app.models.notification import Notification
from app.models.feedback import ComplaintFeedback
from app.models.sla_policy import SLAPolicy
from app.models.anonymous_token import AnonymousTrackingCredential

app = create_app("development")

def seed_database():
    with app.app_context():
        print("Creating all database tables...")
        db.create_all()

        # Check if already seeded
        if City.query.first():
            print("Database already contains data. Skipping seed.")
            return

        print("Seeding Cities...")
        city_indore = City(
            name="Indore Municipal Corporation",
            slug="indore",
            state="Madhya Pradesh",
            country="India",
            latitude=22.7196,
            longitude=75.8577,
            boundary_radius_km=30.0,
            contact_email="helpdesk@indoremunicipal.gov.in",
            helpline_number="0731-2535555",
            is_active=True,
        )
        city_navimumbai = City(
            name="Navi Mumbai Municipal Corporation",
            slug="navi-mumbai",
            state="Maharashtra",
            country="India",
            latitude=19.0330,
            longitude=73.0297,
            boundary_radius_km=35.0,
            contact_email="civic@nmmc.gov.in",
            helpline_number="022-27567070",
            is_active=True,
        )
        db.session.add_all([city_indore, city_navimumbai])
        db.session.flush()

        print("Seeding Complaint Categories...")
        categories_data = [
            {"name": "Roads and Potholes", "code": "roads", "icon": "truck", "dept": "PWD", "desc": "Road damage, asphalt breakdown, and dangerous potholes"},
            {"name": "Water Supply", "code": "water", "icon": "droplet", "dept": "WTR", "desc": "Water pipeline bursts, low pressure, and contaminated water"},
            {"name": "Garbage and Sanitation", "code": "sanitation", "icon": "trash-2", "dept": "SWM", "desc": "Uncollected garbage, overflowing community bins, dead animals"},
            {"name": "Streetlights", "code": "streetlights", "icon": "sun", "dept": "ELEC", "desc": "Dark streets, flickering or damaged streetlight poles"},
            {"name": "Drainage and Sewage", "code": "drainage", "icon": "activity", "dept": "DRG", "desc": "Choked storm drains, overflowing sewers, and open manholes"},
            {"name": "Public Infrastructure", "code": "infrastructure", "icon": "building", "dept": "PWD", "desc": "Damaged sidewalks, broken divider grills, pedestrian bridge issues"},
            {"name": "Parks and Public Spaces", "code": "parks", "icon": "trees", "dept": "PRK", "desc": "Unmaintained public gardens, broken swings, overgrown weeds"},
            {"name": "Other Civic Issues", "code": "other", "icon": "alert-circle", "dept": "PWD", "desc": "General municipal complaints not categorized elsewhere"},
        ]
        created_cats = []
        for cat_info in categories_data:
            cat = ComplaintCategory(
                name=cat_info["name"],
                code=cat_info["code"],
                description=cat_info["desc"],
                icon=cat_info["icon"],
                default_department_code=cat_info["dept"],
                is_active=True,
            )
            db.session.add(cat)
            created_cats.append(cat)
        db.session.flush()

        print("Seeding Departments for Indore and Navi Mumbai...")
        dept_templates = [
            ("Public Works Department", "PWD", "Maintains city roads, bridges, and civic infrastructure"),
            ("Water Supply Department", "WTR", "Oversees potable water pipelines, booster pumps, and tanks"),
            ("Solid Waste Management", "SWM", "Cleanliness, garbage collection, and door-to-door sanitation"),
            ("Electricity & Streetlighting", "ELEC", "Public street lighting, transformers, and electrical poles"),
            ("Drainage & Sewerage", "DRG", "Storm drains, sewer lines, and manhole safety"),
            ("Parks & Public Spaces", "PRK", "Municipal parks, playgrounds, and roadside horticulture"),
        ]

        indore_depts = {}
        for name, code, desc in dept_templates:
            dept = Department(
                city_id=city_indore.id,
                name=name,
                code=code,
                description=desc,
                is_active=True,
            )
            db.session.add(dept)
            indore_depts[code] = dept

        navimumbai_depts = {}
        for name, code, desc in dept_templates:
            dept = Department(
                city_id=city_navimumbai.id,
                name=name,
                code=code,
                description=desc,
                is_active=True,
            )
            db.session.add(dept)
            navimumbai_depts[code] = dept
        db.session.flush()

        print("Seeding Users...")
        # 1. Super Admin
        super_admin = User(
            email="superadmin@pcms.gov.in",
            full_name="Super Administrator",
            role="super_admin",
            preferred_language="en",
            is_active=True,
        )
        super_admin.set_password("Admin@123")

        # 2. City Admins
        indore_admin = User(
            email="admin.indore@pcms.gov.in",
            full_name="Indore City Admin",
            role="city_admin",
            city_id=city_indore.id,
            preferred_language="hi",
            is_active=True,
        )
        indore_admin.set_password("Admin@123")

        navimumbai_admin = User(
            email="admin.navimumbai@pcms.gov.in",
            full_name="Navi Mumbai City Admin",
            role="city_admin",
            city_id=city_navimumbai.id,
            preferred_language="en",
            is_active=True,
        )
        navimumbai_admin.set_password("Admin@123")

        # 3. Department Staff
        staff_pwd_indore = User(
            email="pwd.staff@indore.gov.in",
            full_name="Ramesh Sharma (PWD Indore)",
            role="staff",
            city_id=city_indore.id,
            department_id=indore_depts["PWD"].id,
            phone="9876543210",
            preferred_language="hi",
            is_active=True,
        )
        staff_pwd_indore.set_password("Staff@123")

        staff_swm_indore = User(
            email="sanitation.staff@indore.gov.in",
            full_name="Sunil Verma (Sanitation Indore)",
            role="staff",
            city_id=city_indore.id,
            department_id=indore_depts["SWM"].id,
            phone="9876543211",
            preferred_language="hi",
            is_active=True,
        )
        staff_swm_indore.set_password("Staff@123")

        staff_wtr_nm = User(
            email="water.staff@navimumbai.gov.in",
            full_name="Vikas Patil (Water Navi Mumbai)",
            role="staff",
            city_id=city_navimumbai.id,
            department_id=navimumbai_depts["WTR"].id,
            phone="9876543212",
            preferred_language="en",
            is_active=True,
        )
        staff_wtr_nm.set_password("Staff@123")

        # 4. Citizens
        citizen_rahul = User(
            email="citizen.rahul@example.com",
            full_name="Rahul Gupta",
            role="citizen",
            city_id=city_indore.id,
            phone="9823012345",
            preferred_language="hi",
            is_active=True,
        )
        citizen_rahul.set_password("Citizen@123")

        citizen_priya = User(
            email="citizen.priya@example.com",
            full_name="Priya Deshmukh",
            role="citizen",
            city_id=city_navimumbai.id,
            phone="9823054321",
            preferred_language="en",
            is_active=True,
        )
        citizen_priya.set_password("Citizen@123")

        db.session.add_all([
            super_admin, indore_admin, navimumbai_admin,
            staff_pwd_indore, staff_swm_indore, staff_wtr_nm,
            citizen_rahul, citizen_priya
        ])
        db.session.flush()

        print("Seeding SLA Policies...")
        priorities = [("critical", 12, 8), ("high", 24, 18), ("medium", 72, 48), ("low", 120, 96)]
        for city in [city_indore, city_navimumbai]:
            for p, target, esc in priorities:
                policy = SLAPolicy(
                    city_id=city.id,
                    category_id=None,
                    priority=p,
                    target_resolution_hours=target,
                    escalation_threshold_hours=esc,
                    is_active=True,
                )
                db.session.add(policy)
        db.session.flush()

        print("Seeding Sample Complaints...")
        # Complaint 1: Indore Pothole (In Progress)
        c1 = Complaint(
            complaint_number="CMP-2026-000001",
            title="Severe pothole cluster near Vijay Nagar Square",
            description="Large craters on the main carriageway causing traffic slowdown and two-wheeler skid hazards.",
            category_id=created_cats[0].id,  # roads
            city_id=city_indore.id,
            citizen_id=citizen_rahul.id,
            is_anonymous=False,
            priority="high",
            status="in_progress",
            visibility="public",
            latitude=22.7533,
            longitude=75.8937,
            address="AB Road, near Vijay Nagar Square",
            landmark="Opposite C21 Mall",
            state="Madhya Pradesh",
            assigned_department_id=indore_depts["PWD"].id,
            assigned_staff_id=staff_pwd_indore.id,
            sla_target_hours=24,
            sla_due_at=datetime.utcnow() + timedelta(hours=14),
            support_count=18,
            created_at=datetime.utcnow() - timedelta(hours=10),
        )

        # Complaint 2: Indore Sanitation (Resolved)
        c2 = Complaint(
            complaint_number="CMP-2026-000002",
            title="Overflowing community garbage container in Palasia",
            description="Garbage has not been collected for three days, scattering across the road causing foul odor.",
            category_id=created_cats[2].id,  # sanitation
            city_id=city_indore.id,
            citizen_id=citizen_rahul.id,
            is_anonymous=False,
            priority="medium",
            status="resolved",
            visibility="public",
            latitude=22.7244,
            longitude=75.8839,
            address="Street 4, Old Palasia",
            landmark="Near City Garden",
            state="Madhya Pradesh",
            assigned_department_id=indore_depts["SWM"].id,
            assigned_staff_id=staff_swm_indore.id,
            sla_target_hours=72,
            sla_due_at=datetime.utcnow() - timedelta(hours=5),
            resolved_at=datetime.utcnow() - timedelta(hours=6),
            resolution_remarks="Special sanitation truck dispatched. Container sanitized and surrounding area cleared.",
            support_count=9,
            created_at=datetime.utcnow() - timedelta(hours=30),
        )

        # Complaint 3: Navi Mumbai Water pipeline leak (Overdue)
        c3 = Complaint(
            complaint_number="CMP-2026-000003",
            title="Drinking water pipeline leakage at Sector 17, Vashi",
            description="Clean potable water is gushing out on the footpath for the past 48 hours.",
            category_id=created_cats[1].id,  # water
            city_id=city_navimumbai.id,
            citizen_id=citizen_priya.id,
            is_anonymous=False,
            priority="critical",
            status="under_review",
            visibility="public",
            latitude=19.0760,
            longitude=72.9986,
            address="Sector 17, Near Vashi Plaza",
            landmark="Adjacent to bus stop",
            state="Maharashtra",
            assigned_department_id=navimumbai_depts["WTR"].id,
            sla_target_hours=12,
            sla_due_at=datetime.utcnow() - timedelta(hours=15),
            is_overdue=True,
            escalation_level=1,
            escalated_at=datetime.utcnow() - timedelta(hours=10),
            support_count=24,
            created_at=datetime.utcnow() - timedelta(hours=27),
        )

        # Complaint 4: Anonymous Streetlight complaint
        c4 = Complaint(
            complaint_number="CMP-2026-000004",
            title="Streetlights non-functional along Palm Beach Road",
            description="Entire stretch of streetlights dark for 500 meters creating unsafe conditions at night.",
            category_id=created_cats[3].id,  # streetlights
            city_id=city_navimumbai.id,
            citizen_id=None,
            is_anonymous=True,
            priority="medium",
            status="submitted",
            visibility="public",
            latitude=19.0180,
            longitude=73.0120,
            address="Palm Beach Road, Nerul",
            landmark="Near Wonders Park",
            state="Maharashtra",
            assigned_department_id=navimumbai_depts["ELEC"].id,
            sla_target_hours=72,
            sla_due_at=datetime.utcnow() + timedelta(hours=65),
            support_count=5,
            created_at=datetime.utcnow() - timedelta(hours=7),
        )

        db.session.add_all([c1, c2, c3, c4])
        db.session.flush()

        # Anonymous credentials for c4
        cred4, raw_token_4 = AnonymousTrackingCredential.create_credential(c4.id)
        # Fix raw_token for deterministic demo
        # We can also store a known token for demo purposes: "DEMO-ANON-TOKEN-2026"
        from app.models.anonymous_token import hashlib
        salt_fixed = "demo_salt_indore_2026"
        token_fixed = "DEMO-ANON-TOKEN-2026"
        cred4.salt = salt_fixed
        cred4.token_hash = hashlib.sha256((token_fixed + salt_fixed).encode("utf-8")).hexdigest()
        db.session.add(cred4)

        # Status History for c1
        h1 = ComplaintStatusHistory(
            complaint_id=c1.id,
            from_status="submitted",
            to_status="assigned",
            changed_by_user_id=indore_admin.id,
            remarks="Assigned to PWD for road resurfacing",
            created_at=c1.created_at + timedelta(hours=1),
        )
        h2 = ComplaintStatusHistory(
            complaint_id=c1.id,
            from_status="assigned",
            to_status="in_progress",
            changed_by_user_id=staff_pwd_indore.id,
            remarks="Patchwork asphalt machinery deployed to site.",
            created_at=c1.created_at + timedelta(hours=3),
        )
        # Status History for c2
        h3 = ComplaintStatusHistory(
            complaint_id=c2.id,
            from_status="submitted",
            to_status="resolved",
            changed_by_user_id=staff_swm_indore.id,
            remarks=c2.resolution_remarks,
            created_at=c2.resolved_at,
        )
        db.session.add_all([h1, h2, h3])

        # Feedback for c2
        f2 = ComplaintFeedback(
            complaint_id=c2.id,
            citizen_id=citizen_rahul.id,
            rating=5,
            remarks="Prompt response by Indore Municipal Corporation! Bin cleared thoroughly.",
            timely_resolution=True,
            staff_behavior=True,
        )
        db.session.add(f2)

        # Notifications
        n1 = Notification(
            user_id=citizen_rahul.id,
            title="Complaint In Progress",
            message=f"Your complaint {c1.complaint_number} is now in progress.",
            notification_type="status_changed",
            complaint_id=c1.id,
            is_read=False,
        )
        n2 = Notification(
            user_id=citizen_rahul.id,
            title="Complaint Resolved",
            message=f"Complaint {c2.complaint_number} has been resolved! Please submit feedback.",
            notification_type="complaint_resolved",
            complaint_id=c2.id,
            is_read=True,
        )
        n3 = Notification(
            user_id=staff_pwd_indore.id,
            title="New Assignment",
            message=f"You have been assigned complaint {c1.complaint_number}.",
            notification_type="staff_assigned",
            complaint_id=c1.id,
            is_read=False,
        )
        db.session.add_all([n1, n2, n3])

        # Support vote
        s1 = ComplaintSupport(complaint_id=c1.id, user_id=citizen_rahul.id)
        db.session.add(s1)

        db.session.commit()
        print("Database seeded successfully with realistic civic demo data!")
        print("=============================================================")
        print("Super Admin:      superadmin@pcms.gov.in / Admin@123")
        print("Indore Admin:     admin.indore@pcms.gov.in / Admin@123")
        print("Navi Mumbai Admin: admin.navimumbai@pcms.gov.in / Admin@123")
        print("Indore Staff:     pwd.staff@indore.gov.in / Staff@123")
        print("Indore Citizen:   citizen.rahul@example.com / Citizen@123")
        print("Navi Mumbai Citizen: citizen.priya@example.com / Citizen@123")
        print("Anonymous Demo:   CMP-2026-000004 with Token DEMO-ANON-TOKEN-2026")
        print("=============================================================")

if __name__ == "__main__":
    seed_database()
