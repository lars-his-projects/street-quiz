"""The Python rules and the TypeScript rules (`src/overpass.ts`) must give the same streets for one stored answer."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from fetch_area import overpass_to_streets  # noqa: E402


def test_stored_answer_gives_expected_streets():
    answer = json.loads((ROOT / "tests/fixtures/overpass_sample.json").read_text())
    expected = json.loads((ROOT / "tests/fixtures/overpass_sample.expected.json").read_text())
    assert overpass_to_streets(answer) == expected
