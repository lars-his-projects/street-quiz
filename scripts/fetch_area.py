"""Make the stored street data of one area from OpenStreetMap.

Usage: python3 scripts/fetch_area.py RELATION_ID SLUG

The script asks the Overpass API for the ways with `highway` and `name` in the
area of the OSM relation, and writes `public/areas/<SLUG>.geojson`: one feature
per street name, a MultiLineString with all parts of that street.

Do not run it in CI or in a cloud session (P3): the owner runs it on a computer.
"""

import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
AREA_OFFSET = 3600000000  # Overpass area id = relation id + this offset


def overpass_query(relation_id: int) -> str:
    """Return the Overpass QL query for the named ways in the area of a relation."""
    area_id = AREA_OFFSET + relation_id
    return f'[out:json][timeout:120];area(id:{area_id})->.a;way(area.a)["highway"]["name"];out geom;'


def overpass_to_streets(answer: dict) -> dict:
    """Make a GeoJSON FeatureCollection from an Overpass JSON answer (`out geom`).

    Join the ways of one name into one feature. Leave out ways with no name or no geometry.
    """
    lines_by_name: dict[str, list[list[list[float]]]] = {}
    for element in answer.get("elements", []):
        if element.get("type") != "way":
            continue
        name = (element.get("tags") or {}).get("name", "").strip()
        geometry = element.get("geometry") or []
        if not name or len(geometry) < 2:
            continue
        line = [[point["lon"], point["lat"]] for point in geometry]
        lines_by_name.setdefault(name, []).append(line)
    features = [
        {
            "type": "Feature",
            "properties": {"name": name},
            "geometry": {"type": "MultiLineString", "coordinates": lines},
        }
        for name, lines in sorted(lines_by_name.items())
    ]
    return {"type": "FeatureCollection", "features": features}


def fetch_overpass(relation_id: int) -> dict:
    """Send the query to the Overpass API and return its JSON answer."""
    data = urllib.parse.urlencode({"data": overpass_query(relation_id)}).encode()
    request = urllib.request.Request(OVERPASS_URL, data=data, headers={"User-Agent": "street-quiz/fetch_area"})
    with urllib.request.urlopen(request, timeout=180) as response:
        return json.load(response)


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print(__doc__, file=sys.stderr)
        return 2
    relation_id, slug = int(argv[1]), argv[2]
    streets = overpass_to_streets(fetch_overpass(relation_id))
    out = Path(__file__).resolve().parent.parent / "public" / "areas" / f"{slug}.geojson"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(streets, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{out}: {len(streets['features'])} streets")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
