from fastapi.testclient import TestClient

from app.main import app
from app.rim import cases

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_api_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_list_cases_not_empty():
    r = client.get("/api/cases")
    assert r.status_code == 200
    body = r.json()
    assert isinstance(body, list)
    assert len(body) >= 1
    ids = {c["id"] for c in body}
    assert "article-replication" in ids


def test_get_case_article_replication():
    r = client.get("/api/cases/article-replication")
    assert r.status_code == 200
    body = r.json()
    assert body["id"] == "article-replication"
    assert "input" in body
    assert len(body["input"]["alternatives"]) == 5
    assert len(body["input"]["criteria"]) == 6


def test_get_case_not_found():
    r = client.get("/api/cases/inexistente")
    assert r.status_code == 404


def test_solve_article_replication_matches_expected():
    case = cases.get_case("article-replication")
    payload = case.input.model_dump()
    r = client.post("/api/rim/solve", json=payload)
    assert r.status_code == 200, r.text
    body = r.json()

    # ranking ordenado por R desc; esperado (paper): A2 > A5 > A1 > A4 > A3
    ranking = body["ranking"]
    assert [e["alternative"] for e in ranking] == ["A2", "A5", "A1", "A4", "A3"]

    by_alt = {e["alternative"]: e for e in ranking}
    assert abs(by_alt["A1"]["R"] - 0.5866) < 1e-4
    assert abs(by_alt["A2"]["R"] - 0.7558) < 1e-4
    assert abs(by_alt["A3"]["R"] - 0.3716) < 1e-4
    assert abs(by_alt["A4"]["R"] - 0.4666) < 1e-4
    assert abs(by_alt["A5"]["R"] - 0.7401) < 1e-4


def test_sensitivity_returns_points_with_requested_size():
    case = cases.get_case("article-replication")
    req = {
        "base": case.input.model_dump(),
        "criterion_index": 0,
        "points": 11,
    }
    r = client.post("/api/rim/sensitivity", json=req)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["criterion_index"] == 0
    assert len(body["points"]) == 11
    # primeiro ponto: weight=0, último: weight=1
    assert abs(body["points"][0]["weight"] - 0.0) < 1e-9
    assert abs(body["points"][-1]["weight"] - 1.0) < 1e-9
    # cada ponto tem um ranking completo
    for pt in body["points"]:
        assert len(pt["ranking"]) == 5


def test_solve_invalid_payload_returns_422():
    payload = {
        "alternatives": ["A1", "A2"],
        "criteria": [
            {"name": "C1", "kind": "cost", "A": 4.0, "B": 7.0, "C": 4.0, "D": 4.0},
            {"name": "C2", "kind": "target", "A": 1.0, "B": 2.5, "C": 1.4, "D": 1.8},
        ],
        "weights": [0.6, 0.5],  # soma 1.1
        "X": [[5.0, 1.5], [6.0, 1.7]],
    }
    r = client.post("/api/rim/solve", json=payload)
    assert r.status_code == 422
