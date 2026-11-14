"""The stored street keeps `length`, `highway` and `lanes` (#43)."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

from fetch_area import overpass_to_streets  # noqa: E402


def way(highway, lanes, east):
    """A way on the equator: `east` is its length in degrees of longitude."""
    tags = {"name": "Teststraat", "highway": highway}
    if lanes is not None:
        tags["lanes"] = lanes
    return {"type": "way", "tags": tags, "geometry": [{"lat": 0.0, "lon": 0.0}, {"lat": 0.0, "lon": east}]}


def props(*ways):
    return overpass_to_streets({"elements": list(ways)})["features"][0]["properties"]


def test_length_is_whole_meters():
    assert props(way("residential", None, 0.001))["length"] == 111


def test_highway_is_the_class_with_the_largest_length():
    assert props(way("residential", None, 0.001), way("primary", None, 0.002), way("residential", None, 0.0005))["highway"] == "primary"


def test_lanes_is_the_largest_value():
    assert props(way("primary", "2", 0.001), way("primary", "4", 0.001), way("primary", "3", 0.001))["lanes"] == 4


def test_lanes_missing_counts_as_1():
    assert props(way("primary", None, 0.001))["lanes"] == 1


def test_lanes_not_a_number_counts_as_1():
    assert props(way("primary", "two", 0.001), way("primary", "2;3", 0.001))["lanes"] == 1
