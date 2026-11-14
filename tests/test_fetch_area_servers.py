"""scripts/fetch_area.py asks the next Overpass server when one gives no answer (no network: a false urlopen)."""

import importlib.util
import io
import json
import urllib.error
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("fetch_area_servers", ROOT / "scripts" / "fetch_area.py")
fetch_area = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(fetch_area)

ANSWER = {"elements": [{"type": "way", "tags": {"name": "A"}, "geometry": [{"lon": 1.0, "lat": 2.0}, {"lon": 1.1, "lat": 2.1}]}]}


def serve(monkeypatch, answers):
    """Make `urlopen` give `answers[url]`: an exception to raise, or the text of the answer. Returns the asked URLs."""
    asked = []

    def urlopen(request, timeout=None):
        asked.append(request.full_url)
        answer = answers[request.full_url]
        if isinstance(answer, Exception):
            raise answer
        return io.BytesIO(answer.encode())

    monkeypatch.setattr(fetch_area.urllib.request, "urlopen", urlopen)
    return asked


def test_the_next_server_gets_the_request_when_the_first_gives_no_answer(monkeypatch):
    first, second = fetch_area.OVERPASS_URLS[:2]
    asked = serve(monkeypatch, {first: urllib.error.URLError("reset"), second: json.dumps(ANSWER)})
    assert fetch_area.fetch_overpass(1) == ANSWER
    assert asked == [first, second]


def test_the_first_server_that_answers_is_the_only_one_that_is_asked(monkeypatch):
    first = fetch_area.OVERPASS_URLS[0]
    asked = serve(monkeypatch, {first: json.dumps(ANSWER)})
    assert fetch_area.fetch_overpass(1) == ANSWER and asked == [first]


def test_no_answer_from_each_server_stops_with_the_name_of_each_server(monkeypatch):
    answers = {url: urllib.error.URLError("down") for url in fetch_area.OVERPASS_URLS}
    answers[fetch_area.OVERPASS_URLS[-1]] = "not json"
    serve(monkeypatch, answers)
    with pytest.raises(SystemExit) as stop:
        fetch_area.fetch_overpass(1)
    assert all(url in str(stop.value) for url in fetch_area.OVERPASS_URLS)
