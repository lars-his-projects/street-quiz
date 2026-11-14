"""Make the stored street data of one area from OpenStreetMap.

Usage: python3 scripts/fetch_area.py RELATION_ID SLUG

The script asks the Overpass API for the ways with `highway` and `name` in the
area of the OSM relation, and writes `public/areas/<SLUG>.geojson`: one feature
per street name, a MultiLineString with all parts of that street.

What is a street of the quiz (`overpass_to_streets`; the Jordaan gave these rules, #8):
- Only a way that the public can use: no `access` of `NO_PUBLIC`.
- No platform of a stop and no way that is not built: no `highway` of `NOT_A_STREET`.
- No bridge: a name with more than `BRIDGE_SHARE` of its length on bridge ways is the name of a bridge.
- No dot: a name with less than `MIN_LENGTH` meters. The other part of such a street is outside the area.

Do not run it in CI or in a test (P3). An agent or the owner runs it on purpose, one time for one area.
The data is © OpenStreetMap contributors (Open Database License, https://www.openstreetmap.org/copyright).
"""

import json
import math
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

# The servers of the Overpass API, in the sequence of the tries. The first one resets a connection from a cloud
# session (2026-11-14): then the next server gets the same request.
OVERPASS_URLS = (
    "https://overpass-api.de/api/interpreter",
    "https://overpass.openstreetmap.fr/api/interpreter",
)
AREA_OFFSET = 3600000000  # Overpass area id = relation id + this offset
NO_PUBLIC = frozenset({"private", "no"})  # values of `access`: the public cannot use the way
NOT_A_STREET = frozenset({"platform", "corridor", "elevator", "construction", "proposed"})  # values of `highway`
BRIDGE_SHARE = 0.5  # a name with a larger part of its length on bridges is the name of a bridge
MIN_LENGTH = 15.0  # meters: a shorter street is a dot on the map
EARTH_RADIUS = 6371008.8  # meters


def overpass_query(relation_id: int) -> str:
    """Return the Overpass QL query for the named ways in the area of a relation."""
    area_id = AREA_OFFSET + relation_id
    return f'[out:json][timeout:120];area(id:{area_id})->.a;way(area.a)["highway"]["name"];out geom;'


def line_length(line: list[list[float]]) -> float:
    """Return the length in meters of a line of [lon, lat] points (a flat map: good for the size of a city)."""
    total = 0.0
    for (lon1, lat1), (lon2, lat2) in zip(line, line[1:]):
        east = math.radians(lon2 - lon1) * math.cos(math.radians((lat1 + lat2) / 2))
        total += EARTH_RADIUS * math.hypot(east, math.radians(lat2 - lat1))
    return total


def is_street_way(element: dict) -> bool:
    """Say if an Overpass element is a way with a name and a line that the public can use as a street."""
    tags = element.get("tags") or {}
    return (
        element.get("type") == "way"
        and bool(tags.get("name", "").strip())
        and len(element.get("geometry") or []) >= 2
        and tags.get("highway") not in NOT_A_STREET
        and tags.get("access") not in NO_PUBLIC
    )


def overpass_to_streets(answer: dict) -> dict:
    """Make a GeoJSON FeatureCollection from an Overpass JSON answer (`out geom`).

    Join the ways of one name into one feature. Keep only the streets of the quiz: the rules are at the top of this file.
    """
    lines_by_name: dict[str, list[list[list[float]]]] = {}
    length_by_name: dict[str, float] = {}
    bridge_by_name: dict[str, float] = {}
    for element in answer.get("elements", []):
        if not is_street_way(element):
            continue
        tags = element["tags"]
        name = tags["name"].strip()
        line = [[point["lon"], point["lat"]] for point in element["geometry"]]
        length = line_length(line)
        lines_by_name.setdefault(name, []).append(line)
        length_by_name[name] = length_by_name.get(name, 0.0) + length
        if tags.get("bridge", "no") != "no":
            bridge_by_name[name] = bridge_by_name.get(name, 0.0) + length
    features = [
        {
            "type": "Feature",
            "properties": {"name": name},
            "geometry": {"type": "MultiLineString", "coordinates": lines},
        }
        for name, lines in sorted(lines_by_name.items())
        if length_by_name[name] >= MIN_LENGTH and bridge_by_name.get(name, 0.0) <= BRIDGE_SHARE * length_by_name[name]
    ]
    return {"type": "FeatureCollection", "features": features}


def fetch_overpass(relation_id: int) -> dict:
    """Send the query to the Overpass API and return its JSON answer.

    Try each server of `OVERPASS_URLS` one time. Stop with a message when no server gives an answer.
    """
    data = urllib.parse.urlencode({"data": overpass_query(relation_id)}).encode()
    errors = []
    for url in OVERPASS_URLS:
        request = urllib.request.Request(url, data=data, headers={"User-Agent": "street-quiz/fetch_area"})
        try:
            with urllib.request.urlopen(request, timeout=180) as response:
                return json.load(response)
        except (urllib.error.URLError, TimeoutError, ValueError) as error:
            errors.append(f"{url}: {error}")
    raise SystemExit("No Overpass server gave an answer:\n" + "\n".join(errors))


def write_area(slug: str, streets: dict) -> Path:
    """Write the streets of an area to `public/areas/<slug>.geojson` and return the path of the file."""
    out = Path(__file__).resolve().parent.parent / "public" / "areas" / f"{slug}.geojson"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(streets, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    return out


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print(__doc__, file=sys.stderr)
        return 2
    relation_id, slug = int(argv[1]), argv[2]
    streets = overpass_to_streets(fetch_overpass(relation_id))
    print(f"{write_area(slug, streets)}: {len(streets['features'])} streets")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
