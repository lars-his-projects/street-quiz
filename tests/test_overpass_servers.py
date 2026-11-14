"""The app and `scripts/fetch_area.py` ask the same Overpass servers, and no server that refuses the app (#52)."""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from fetch_area import OVERPASS_URLS  # noqa: E402


def app_servers():
    text = (ROOT / "src/area.ts").read_text()
    block = re.search(r"OVERPASS_URLS = \[(.*?)\]", text, re.S).group(1)
    return tuple(re.findall(r'"([^"]+)"', block))


def test_app_and_script_ask_the_same_servers():
    assert app_servers() == OVERPASS_URLS


def test_no_server_that_refuses_the_app():
    assert not [url for url in OVERPASS_URLS if "overpass.openstreetmap.fr" in url]
    assert len(OVERPASS_URLS) >= 2
