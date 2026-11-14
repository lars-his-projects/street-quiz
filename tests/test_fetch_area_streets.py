"""scripts/fetch_area.py keeps only the streets of the quiz: public ways, no platform, no bridge, no dot (no network)."""

import importlib.util
import math
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("fetch_area_streets", ROOT / "scripts" / "fetch_area.py")
fetch_area = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(fetch_area)

LONG = 10 * fetch_area.MIN_LENGTH  # meters: a street that is not a dot


def way(name, meters, lon=4.0, **tags):
    """An Overpass way with the tags of a usual street that goes `meters` to the north."""
    north = math.degrees(meters / fetch_area.EARTH_RADIUS)
    return {
        "type": "way",
        "tags": {"highway": "residential", "name": name, **tags},
        "geometry": [{"lon": lon, "lat": 52.0}, {"lon": lon, "lat": 52.0 + north}],
    }


def streets(*ways):
    """{name: the number of its lines} of the streets that the script makes from the ways."""
    features = fetch_area.overpass_to_streets({"elements": list(ways)})["features"]
    return {f["properties"]["name"]: len(f["geometry"]["coordinates"]) for f in features}


def test_the_length_of_a_line_is_in_meters():
    north = [[4.0, 52.0], [4.0, 52.0 + math.degrees(100 / fetch_area.EARTH_RADIUS)]]
    east = [[4.0, 52.0], [4.0 + math.degrees(100 / fetch_area.EARTH_RADIUS) / math.cos(math.radians(52.0)), 52.0]]
    assert fetch_area.line_length(north) == pytest.approx(100, rel=1e-6)
    assert fetch_area.line_length(east) == pytest.approx(100, rel=1e-6)
    assert fetch_area.line_length(north + [north[0]]) == pytest.approx(200, rel=1e-6)
    assert fetch_area.line_length([[4.0, 52.0]]) == 0


@pytest.mark.parametrize("access", sorted(fetch_area.NO_PUBLIC))
def test_a_way_that_the_public_cannot_use_is_left_out(access):
    got = streets(way("Closed", LONG, access=access), way("Open", LONG), way("Half", LONG), way("Half", LONG, access=access))
    assert got == {"Open": 1, "Half": 1}


def test_a_way_with_another_access_value_stays():
    assert streets(way("Open", LONG, access="yes"), way("Guests", LONG, access="destination")) == {"Open": 1, "Guests": 1}


@pytest.mark.parametrize("highway", sorted(fetch_area.NOT_A_STREET))
def test_a_way_that_is_not_a_street_is_left_out(highway):
    assert streets(way("Stop", LONG, highway=highway), way("Path", LONG, highway="footway")) == {"Path": 1}


def test_the_name_of_a_bridge_is_left_out():
    over = fetch_area.BRIDGE_SHARE + 0.1
    got = streets(
        way("Bridge", LONG, bridge="yes"),
        way("Bridge with a ramp", over * LONG, bridge="movable"),
        way("Bridge with a ramp", (1 - over) * LONG),
    )
    assert got == {}


def test_a_street_keeps_the_bridge_that_it_goes_over():
    under = fetch_area.BRIDGE_SHARE - 0.1
    got = streets(way("Quay", under * LONG, bridge="yes"), way("Quay", (1 - under) * LONG), way("Road", LONG, bridge="no"))
    assert got == {"Quay": 2, "Road": 1}


def test_a_street_that_is_only_a_dot_is_left_out():
    short = fetch_area.MIN_LENGTH - 1
    assert streets(way("Dot", short), way("Line", fetch_area.MIN_LENGTH + 1)) == {"Line": 1}
    assert streets(way("Two parts", short), way("Two parts", short, lon=4.001)) == {"Two parts": 2}
