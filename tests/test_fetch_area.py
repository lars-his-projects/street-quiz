"""Tests of scripts/fetch_area.py with a stored Overpass answer (no network, P3)."""

import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("fetch_area", ROOT / "scripts" / "fetch_area.py")
fetch_area = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(fetch_area)


def _streets():
    answer = json.loads((ROOT / "tests" / "data" / "overpass_small.json").read_text(encoding="utf-8"))
    return fetch_area.overpass_to_streets(answer)


def test_joins_the_ways_of_one_name_into_one_feature():
    features = {f["properties"]["name"]: f for f in _streets()["features"]}
    assert sorted(features) == ["Ackerweg", "Hauptstraße"]
    main = features["Hauptstraße"]["geometry"]
    assert main["type"] == "MultiLineString"
    assert len(main["coordinates"]) == 2
    assert main["coordinates"][0][0] == [13.0, 52.0]


def test_leaves_out_ways_with_no_name():
    assert len(_streets()["features"]) == 2


def test_query_uses_the_area_of_the_relation():
    assert "area(id:3600062422)" in fetch_area.overpass_query(62422)
