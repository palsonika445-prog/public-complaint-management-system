import os
import sys
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
from app.models.comment import ComplaintComment
from app.models.feedback import ComplaintFeedback
from app.models.escalation import EscalationEvent
from app.models.notification import Notification
from app.models.sla_policy import SLAPolicy
from app.services.id_generator import generate_complaint_number

app = create_app("development")

def seed_rich_data():
    with app.app_context():
        print("Starting rich demo data seeding for PCMS...")

        # 1. Ensure Rohtak is onboarded
        rohtak = City.query.filter_by(slug="rohtak").first()
        if not rohtak:
            print("Onboarding Rohtak Municipal Corporation...")
            rohtak = City(
                name="Rohtak Municipal Corporation",
                slug="rohtak",
                state="Haryana",
                country="India",
                latitude=28.8955,
                longitude=76.6066,
                boundary_radius_km=25.0,
                contact_email="helpdesk@rohtakmc.gov.in",
                helpline_number="01262-245000",
                is_active=True,
            )
            db.session.add(rohtak)
            db.session.flush()

            # Provision departments for Rohtak
            depts_meta = [
                ("Public Works Department", "PWD", "Road repairs, potholes, civil works"),
                ("Solid Waste Management", "SWM", "Garbage collection, street cleaning"),
                ("Water Supply & Sewerage", "WTR", "Pipeline leaks, water supply"),
                ("Electrical Maintenance", "ELEC", "Streetlights and electrical safety"),
                ("Drainage & Flood Control", "DRG", "Storm drains and sewage blockages"),
            ]
            for name, code, desc in depts_meta:
                dept = Department(name=name, code=code, description=desc, city_id=rohtak.id, is_active=True)
                db.session.add(dept)

            admin_rohtak = User(
                email="admin.rohtak@pcms.gov.in",
                full_name="Rohtak City Admin",
                role="city_admin",
                city_id=rohtak.id,
                preferred_language="hi",
                is_active=True
            )
            admin_rohtak.set_password("Admin@123")
            db.session.add(admin_rohtak)
            db.session.commit()
            print("Rohtak onboarded successfully!")

        cities = City.query.filter(City.slug.in_(["indore", "jhajjar", "navi-mumbai", "rohtak"])).all()
        categories = {c.name: c for c in ComplaintCategory.query.all()}
        citizen = User.query.filter_by(role="citizen").first()
        if not citizen:
            citizen = User(
                email="citizen.rahul@example.com",
                full_name="Rahul Gupta",
                role="citizen",
                city_id=cities[0].id,
                phone="9812345678",
                preferred_language="hi",
                is_active=True,
                is_aadhaar_verified=True,
                aadhaar_last4="4819",
                kyc_document_type="digilocker_aadhaar",
                kyc_verified_at=datetime.utcnow()
            )
            citizen.set_password("Citizen@123")
            db.session.add(citizen)
            db.session.commit()
        else:
            citizen.is_aadhaar_verified = True
            citizen.aadhaar_last4 = "4819"
            citizen.kyc_document_type = "digilocker_aadhaar"
            citizen.kyc_verified_at = datetime.utcnow()
            db.session.commit()

        now = datetime.utcnow()

        for city in cities:
            print(f"\n--- Seeding complaints for {city.name} ---")
            depts = {d.code: d for d in Department.query.filter_by(city_id=city.id).all()}
            if not depts:
                continue

            # Ensure staff users exist for PWD and SWM in this city
            pwd_staff = User.query.filter_by(city_id=city.id, role="staff", department_id=depts.get("PWD", list(depts.values())[0]).id).first()
            if not pwd_staff:
                pwd_staff = User(
                    email=f"pwd.staff.{city.slug}@pcms.gov.in",
                    full_name=f"Vikas Verma ({city.slug.title()} PWD)",
                    role="staff",
                    city_id=city.id,
                    department_id=depts.get("PWD", list(depts.values())[0]).id,
                    phone="9876540001",
                    preferred_language="hi",
                    is_active=True
                )
                pwd_staff.set_password("Staff@123")
                db.session.add(pwd_staff)
                db.session.commit()

            swm_staff = User.query.filter_by(city_id=city.id, role="staff", department_id=depts.get("SWM", list(depts.values())[0]).id).first()
            if not swm_staff:
                swm_staff = User(
                    email=f"swm.staff.{city.slug}@pcms.gov.in",
                    full_name=f"Sunil Kumar ({city.slug.title()} Sanitation)",
                    role="staff",
                    city_id=city.id,
                    department_id=depts.get("SWM", list(depts.values())[0]).id,
                    phone="9876540002",
                    preferred_language="hi",
                    is_active=True
                )
                swm_staff.set_password("Staff@123")
                db.session.add(swm_staff)
                db.session.commit()

            city_lat = city.latitude or 28.6139
            city_lng = city.longitude or 77.2090

            # -------------------------------------------------------------
            # GROUP A: 4 PENDING ALLOCATION CASES (Status: submitted / under_review)
            # -------------------------------------------------------------
            pending_cases = [
                {
                    "title": f"Dangerous open pothole cluster on Main Market Road",
                    "desc": "Multiple deep potholes causing traffic congestion and severe hazard to two-wheeler riders during rain.",
                    "cat": "Roads and Potholes",
                    "priority": "high",
                    "status": "submitted",
                    "landmark": "Near Central Bank & Main Market Gate",
                    "sla_target": 24,
                    "delta_hours": 2,
                },
                {
                    "title": f"Overflowing municipal garbage bin creating foul stench",
                    "desc": "Garbage has not been collected for 3 days; stray animals scattering waste on pedestrian walkway.",
                    "cat": "Garbage and Sanitation",
                    "priority": "medium",
                    "status": "submitted",
                    "landmark": "Opposite Community Park Gate 2",
                    "sla_target": 48,
                    "delta_hours": 4,
                },
                {
                    "title": f"Contaminated yellowish tap water supply in residential lane",
                    "desc": "Drinking water supply has strong foul odor and yellowish color since morning. Multiple families affected.",
                    "cat": "Water Supply",
                    "priority": "critical",
                    "status": "under_review",
                    "landmark": "Street No. 4, Block B",
                    "sla_target": 12,
                    "delta_hours": 3,
                },
                {
                    "title": f"Broken concrete cover over roadside stormwater drain",
                    "desc": "Heavy slab broken by passing vehicle, creating 5-feet deep open drop risk for children and pedestrians.",
                    "cat": "Drainage and Sewage",
                    "priority": "high",
                    "status": "under_review",
                    "landmark": "Near Government High School crossing",
                    "sla_target": 24,
                    "delta_hours": 5,
                },
            ]

            for item in pending_cases:
                cat_obj = categories.get(item["cat"], list(categories.values())[0])
                c_num = generate_complaint_number()
                c_created = now - timedelta(hours=item["delta_hours"])
                c = Complaint(
                    complaint_number=c_num,
                    title=item["title"],
                    description=item["desc"],
                    category_id=cat_obj.id,
                    city_id=city.id,
                    citizen_id=citizen.id,
                    priority=item["priority"],
                    status=item["status"],
                    visibility="public",
                    address=f"{item['landmark']}, {city.name}, {city.state}",
                    landmark=item["landmark"],
                    latitude=city_lat + 0.003,
                    longitude=city_lng + 0.003,
                    sla_target_hours=item["sla_target"],
                    sla_due_at=c_created + timedelta(hours=item["sla_target"]),
                    is_overdue=False,
                    escalation_level=0,
                    created_at=c_created,
                    updated_at=c_created
                )
                db.session.add(c)
                db.session.flush()

                hist = ComplaintStatusHistory(
                    complaint_id=c.id,
                    from_status=None,
                    to_status=item["status"],
                    changed_by_user_id=citizen.id,
                    remarks="Complaint registered through PCMS web portal",
                    created_at=c_created
                )
                db.session.add(hist)

            # -------------------------------------------------------------
            # GROUP B: 4 IN-PROGRESS CASES (Assigned to Staff with active timers)
            # -------------------------------------------------------------
            in_prog_cases = [
                {
                    "title": f"Burst water pipeline gushing water onto main roadway",
                    "desc": "Main feeder line leak wasting drinking water and flooding vehicular lane.",
                    "cat": "Water Supply",
                    "dept_code": "WTR",
                    "staff": pwd_staff,
                    "priority": "critical",
                    "landmark": "Subhash Chowk junction",
                    "sla_target": 12,
                    "created_hours_ago": 6,
                },
                {
                    "title": f"Blackout on stretch of 8 streetlights along Ring Road",
                    "desc": "Underground cable fault causing complete darkness, vulnerable area for commuters at night.",
                    "cat": "Streetlights",
                    "dept_code": "ELEC",
                    "staff": pwd_staff,
                    "priority": "medium",
                    "landmark": "Ring Road Sector 7 overbridge",
                    "sla_target": 48,
                    "created_hours_ago": 18,
                },
                {
                    "title": f"Sewage manhole backflow into commercial market lane",
                    "desc": "Manhole choked with plastic waste, black water overflowing into shop entrances.",
                    "cat": "Drainage and Sewage",
                    "dept_code": "DRG",
                    "staff": swm_staff,
                    "priority": "high",
                    "landmark": "Cloth Market Lane 3",
                    "sla_target": 24,
                    "created_hours_ago": 10,
                },
                {
                    "title": f"Public park children play area fence damaged & rusted",
                    "desc": "Iron grills broken with sharp rusted edges posing severe injury hazard to playing children.",
                    "cat": "Parks and Public Spaces",
                    "dept_code": "PWD",
                    "staff": pwd_staff,
                    "priority": "medium",
                    "landmark": "Gandhi Smriti Park",
                    "sla_target": 48,
                    "created_hours_ago": 20,
                },
            ]

            for item in in_prog_cases:
                cat_obj = categories.get(item["cat"], list(categories.values())[0])
                c_num = generate_complaint_number()
                c_created = now - timedelta(hours=item["created_hours_ago"])
                dept_obj = depts.get(item["dept_code"], list(depts.values())[0])

                c = Complaint(
                    complaint_number=c_num,
                    title=item["title"],
                    description=item["desc"],
                    category_id=cat_obj.id,
                    city_id=city.id,
                    citizen_id=citizen.id,
                    assigned_department_id=dept_obj.id,
                    assigned_staff_id=item["staff"].id,
                    priority=item["priority"],
                    status="in_progress",
                    visibility="public",
                    address=f"{item['landmark']}, {city.name}, {city.state}",
                    landmark=item["landmark"],
                    latitude=city_lat - 0.004,
                    longitude=city_lng + 0.002,
                    sla_target_hours=item["sla_target"],
                    sla_due_at=c_created + timedelta(hours=item["sla_target"]),
                    is_overdue=False,
                    escalation_level=0,
                    created_at=c_created,
                    updated_at=now
                )
                db.session.add(c)
                db.session.flush()

                assign = ComplaintAssignment(
                    complaint_id=c.id,
                    department_id=dept_obj.id,
                    staff_id=item["staff"].id,
                    assigned_by_user_id=None,
                    is_current=True,
                    assigned_at=c_created + timedelta(hours=1)
                )
                db.session.add(assign)

                comm = ComplaintComment(
                    complaint_id=c.id,
                    user_id=item["staff"].id,
                    comment="Field inspection completed. Repair material and maintenance team dispatched on site.",
                    is_internal=False,
                    created_at=c_created + timedelta(hours=2)
                )
                db.session.add(comm)

            # -------------------------------------------------------------
            # GROUP C: 4 OVERDUE SLA CASES (With Red Overdue Flag & Level 1/2 Escalation)
            # -------------------------------------------------------------
            overdue_cases = [
                {
                    "title": f"CRITICAL: Raw sewage flooding into residential basements",
                    "desc": "Main trunk sewer collapsed. Stagnant sewer water 2 feet deep in cellars for 4 days.",
                    "cat": "Drainage and Sewage",
                    "dept_code": "DRG",
                    "staff": swm_staff,
                    "priority": "critical",
                    "landmark": "Vikas Nagar Phase 1, Lane 8",
                    "sla_target": 12,
                    "created_days_ago": 4,
                    "esc_level": 2,
                    "esc_reason": "SLA breach > 72 hours, escalated to Municipal Commissioner",
                },
                {
                    "title": f"Hazardous open electrical distribution box with live wires",
                    "desc": "Door of roadside transformer box torn open, exposed high-voltage wiring within reach of children.",
                    "cat": "Streetlights",
                    "dept_code": "ELEC",
                    "staff": pwd_staff,
                    "priority": "critical",
                    "landmark": "Near DAV Public School boundary wall",
                    "sla_target": 12,
                    "created_days_ago": 3,
                    "esc_level": 1,
                    "esc_reason": "SLA breach > 24 hours, escalated to Head of Electrical Works",
                },
                {
                    "title": f"Illegal massive garbage dumping ground emitting toxic smoke",
                    "desc": "Commercial waste dumped on vacant municipal plot set on fire by miscreants. Heavy smoke engulfing colony.",
                    "cat": "Garbage and Sanitation",
                    "dept_code": "SWM",
                    "staff": swm_staff,
                    "priority": "high",
                    "landmark": "Sector 12 outer bypass green belt",
                    "sla_target": 24,
                    "created_days_ago": 5,
                    "esc_level": 2,
                    "esc_reason": "High priority environmental breach, multiple citizen complaints",
                },
                {
                    "title": f"Major water supply pipeline rupture flooding railway underpass",
                    "desc": "Vehicles submerged up to wheels in underpass. Clean drinking water wasted for over 48 hours.",
                    "cat": "Water Supply",
                    "dept_code": "WTR",
                    "staff": pwd_staff,
                    "priority": "high",
                    "landmark": "Railway Underbridge 4A",
                    "sla_target": 24,
                    "created_days_ago": 3,
                    "esc_level": 1,
                    "esc_reason": "SLA Target 24h passed, automatic Level 1 alert sent to City Admin",
                },
            ]

            for item in overdue_cases:
                cat_obj = categories.get(item["cat"], list(categories.values())[0])
                c_num = generate_complaint_number()
                c_created = now - timedelta(days=item["created_days_ago"])
                dept_obj = depts.get(item["dept_code"], list(depts.values())[0])

                c = Complaint(
                    complaint_number=c_num,
                    title=item["title"],
                    description=item["desc"],
                    category_id=cat_obj.id,
                    city_id=city.id,
                    citizen_id=citizen.id,
                    assigned_department_id=dept_obj.id,
                    assigned_staff_id=item["staff"].id,
                    priority=item["priority"],
                    status="in_progress",
                    visibility="public",
                    address=f"{item['landmark']}, {city.name}, {city.state}",
                    landmark=item["landmark"],
                    latitude=city_lat + 0.005,
                    longitude=city_lng - 0.003,
                    sla_target_hours=item["sla_target"],
                    sla_due_at=c_created + timedelta(hours=item["sla_target"]),
                    is_overdue=True,
                    escalation_level=item["esc_level"],
                    created_at=c_created,
                    updated_at=now - timedelta(hours=6)
                )
                db.session.add(c)
                db.session.flush()

                esc = EscalationEvent(
                    complaint_id=c.id,
                    city_id=city.id,
                    level=item["esc_level"],
                    reason=item["esc_reason"],
                    created_at=c.sla_due_at + timedelta(hours=4)
                )
                db.session.add(esc)

            # -------------------------------------------------------------
            # GROUP D: 1 LIVE SLA TRIGGER CASE (Ready for teacher presentation button click!)
            # -------------------------------------------------------------
            live_sla_cat = categories.get("Roads and Potholes", list(categories.values())[0])
            live_c_num = generate_complaint_number()
            # Created 36 hours ago with 24-hour target: due date was 12 hours ago!
            # Initially is_overdue = False, escalation_level = 0.
            # When user clicks "Trigger SLA Check", the engine detects it, sets is_overdue = True, escalation_level = 1!
            live_created = now - timedelta(hours=36)
            live_c = Complaint(
                complaint_number=live_c_num,
                title=f"LIVE DEMO CASE: Road cave-in near Hospital Emergency Gate",
                description="Heavy truck caused road surface collapse. Target resolution 24 hours. Ready for Live SLA escalation trigger in front of examiner.",
                category_id=live_sla_cat.id,
                city_id=city.id,
                citizen_id=citizen.id,
                assigned_department_id=depts.get("PWD", list(depts.values())[0]).id,
                assigned_staff_id=pwd_staff.id,
                priority="high",
                status="in_progress",
                visibility="public",
                address=f"Civil Hospital Emergency Exit Road, {city.name}",
                landmark="Civil Hospital Emergency Gate",
                latitude=city_lat + 0.001,
                longitude=city_lng + 0.001,
                sla_target_hours=24,
                sla_due_at=live_created + timedelta(hours=24), # Due 12 hours ago!
                is_overdue=False, # INTENTIONALLY FALSE to demo live trigger!
                escalation_level=0,
                created_at=live_created,
                updated_at=live_created
            )
            db.session.add(live_c)

            # -------------------------------------------------------------
            # GROUP E: 3 RESOLVED CASES WITH 5-STAR CITIZEN FEEDBACK
            # -------------------------------------------------------------
            resolved_cases = [
                {
                    "title": f"Deep crater pothole repaired and resurfaced at Main Crossroads",
                    "desc": "Deep pothole filled with hot mix asphalt and leveled with roller.",
                    "cat": "Roads and Potholes",
                    "dept_code": "PWD",
                    "staff": pwd_staff,
                    "landmark": "Nehru Chowk Circle",
                    "rating": 5,
                    "feedback": "Prompt and excellent work! The pothole was repaired cleanly within 24 hours.",
                },
                {
                    "title": f"Community garbage pile cleared and disinfectant powder sprayed",
                    "desc": "Entire accumulated waste lifted via tractor-trolley and bleaching powder sprayed.",
                    "cat": "Garbage and Sanitation",
                    "dept_code": "SWM",
                    "staff": swm_staff,
                    "landmark": "Ward No. 11 Community Center",
                    "rating": 5,
                    "feedback": "Thank you municipal team for restoring hygiene near our houses!",
                },
                {
                    "title": f"Main water line airlock and valve leakage fixed",
                    "desc": "Corroded flange gasket replaced and normal pipeline water pressure restored.",
                    "cat": "Water Supply",
                    "dept_code": "WTR",
                    "staff": pwd_staff,
                    "landmark": "Behind Water Booster Station",
                    "rating": 4,
                    "feedback": "Water supply is back to full pressure. Satisfied with resolution.",
                },
            ]

            for item in resolved_cases:
                cat_obj = categories.get(item["cat"], list(categories.values())[0])
                c_num = generate_complaint_number()
                c_created = now - timedelta(days=6)
                dept_obj = depts.get(item["dept_code"], list(depts.values())[0])

                c = Complaint(
                    complaint_number=c_num,
                    title=item["title"],
                    description=item["desc"],
                    category_id=cat_obj.id,
                    city_id=city.id,
                    citizen_id=citizen.id,
                    assigned_department_id=dept_obj.id,
                    assigned_staff_id=item["staff"].id,
                    priority="medium",
                    status="resolved",
                    visibility="public",
                    address=f"{item['landmark']}, {city.name}, {city.state}",
                    landmark=item["landmark"],
                    latitude=city_lat - 0.002,
                    longitude=city_lng - 0.002,
                    sla_target_hours=48,
                    sla_due_at=c_created + timedelta(hours=48),
                    is_overdue=False,
                    escalation_level=0,
                    resolution_remarks="Work inspected and verified by municipal engineer. Action taken on site.",
                    resolved_at=c_created + timedelta(hours=30),
                    created_at=c_created,
                    updated_at=c_created + timedelta(hours=30)
                )
                db.session.add(c)
                db.session.flush()

                fb = ComplaintFeedback(
                    complaint_id=c.id,
                    citizen_id=citizen.id,
                    rating=item["rating"],
                    remarks=item["feedback"],
                    timely_resolution=True,
                    staff_behavior=True,
                    created_at=c.resolved_at + timedelta(hours=2)
                )
                db.session.add(fb)

        db.session.commit()
        print("\nAll rich demo data seeded successfully across all cities!")

if __name__ == "__main__":
    seed_rich_data()
