import requests
from flask import current_app

# Simple in-memory cache for reverse geocoding to respect OSM Nominatim usage policy
_GEOCODE_CACHE = {}

def reverse_geocode(latitude, longitude):
    """
    Reverse geocodes coordinates into an address string using Nominatim OSM.
    Caches results keyed by rounded coordinates (~100m) to throttle outbound requests.
    """
    cache_key = (round(latitude, 4), round(longitude, 4))
    if cache_key in _GEOCODE_CACHE:
        return _GEOCODE_CACHE[cache_key]

    base_url = current_app.config.get("NOMINATIM_BASE_URL", "https://nominatim.openstreetmap.org")
    user_agent = current_app.config.get("NOMINATIM_USER_AGENT", "PCMS-Civic-Tech-App/1.0")

    try:
        url = f"{base_url}/reverse"
        params = {
            "lat": latitude,
            "lon": longitude,
            "format": "jsonv2",
            "zoom": 18,
            "addressdetails": 1,
        }
        headers = {"User-Agent": user_agent}
        response = requests.get(url, params=params, headers=headers, timeout=3)
        if response.status_code == 200:
            data = response.json()
            display_name = data.get("display_name")
            address_obj = data.get("address", {})
            
            result = {
                "display_name": display_name,
                "road": address_obj.get("road") or address_obj.get("suburb"),
                "city": address_obj.get("city") or address_obj.get("town") or address_obj.get("village"),
                "state": address_obj.get("state"),
                "postcode": address_obj.get("postcode"),
            }
            _GEOCODE_CACHE[cache_key] = result
            return result
    except Exception:
        # Graceful fallback when network is unavailable or rate-limited
        pass

    fallback = {
        "display_name": f"Location ({latitude:.4f}, {longitude:.4f})",
        "road": None,
        "city": None,
        "state": None,
        "postcode": None,
    }
    return fallback
