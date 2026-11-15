from flask import Blueprint, request, jsonify
from app.services.geocoding_service import reverse_geocode

map_bp = Blueprint("maps", __name__, url_prefix="/api/maps")

@map_bp.route("/reverse-geocode", methods=["GET"])
def get_address():
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lon"))
    except (TypeError, ValueError):
        return jsonify({"error": "Valid lat and lon query parameters are required"}), 400

    address = reverse_geocode(lat, lon)
    return jsonify({"address": address}), 200
