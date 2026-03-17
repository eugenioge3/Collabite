import json

from api import handler


def test_build_health_payload_returns_ok_when_database_is_healthy(monkeypatch):
    monkeypatch.setattr(handler, "_check_database_health", lambda: {"status": "ok"})

    status_code, payload = handler._build_health_payload()

    assert status_code == 200
    assert payload["status"] == "ok"
    assert payload["checks"]["api"] == "ok"
    assert payload["checks"]["database"] == "ok"


def test_build_health_payload_returns_503_when_database_is_unreachable(monkeypatch):
    monkeypatch.setattr(
        handler,
        "_check_database_health",
        lambda: {"status": "error", "error": "database_unreachable"},
    )

    status_code, payload = handler._build_health_payload()

    assert status_code == 503
    assert payload["status"] == "degraded"
    assert payload["checks"]["database"] == "error"
    assert payload["checks"]["database_error"] == "database_unreachable"


def test_health_check_endpoint_returns_json_response(monkeypatch):
    monkeypatch.setattr(handler, "_build_health_payload", lambda: (200, {"status": "ok"}))

    response = handler.health_check()

    assert response.status_code == 200
    assert json.loads(response.body.decode("utf-8")) == {"status": "ok"}
