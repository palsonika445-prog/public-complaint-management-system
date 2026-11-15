import math
from datetime import datetime, timedelta
from app.models.complaint import Complaint

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Computes distance in meters between two coordinates using the Haversine formula.
    """
    R = 6371000  # Radius of earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def find_potential_duplicates(city_id, category_id, latitude, longitude, radius_meters=1000, days_window=30):
    """
    Finds active complaints within radius_meters and days_window in the same category.
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days_window)
    candidates = (
        Complaint.query.filter(
            Complaint.city_id == city_id,
            Complaint.category_id == category_id,
            Complaint.status.notin_(["rejected", "closed"]),
            Complaint.created_at >= cutoff_date,
            Complaint.is_duplicate == False,
        )
        .all()
    )

    matches = []
    for c in candidates:
        dist = haversine_distance(latitude, longitude, c.latitude, c.longitude)
        if dist <= radius_meters:
            matches.append({
                "id": c.id,
                "complaint_number": c.complaint_number,
                "title": c.title,
                "status": c.status,
                "category_name": c.category.name if c.category else "",
                "landmark": c.landmark,
                "distance_meters": round(dist, 1),
                "support_count": c.support_count,
                "created_at": c.created_at.isoformat(),
            })

    # Sort nearest first
    matches.sort(key=lambda x: x["distance_meters"])
    return matches
