from api.influencers import _apply_filters


class _DummyProfileColumn:
    def __init__(self, field_name: str):
        self.field_name = field_name

    def ilike(self, value: str):
        return ("ilike", self.field_name, value)

    def __eq__(self, value):
        return ("eq", self.field_name, value)

    def __ge__(self, value):
        return ("ge", self.field_name, value)

    def __le__(self, value):
        return ("le", self.field_name, value)


class _DummyInfluencerProfile:
    city = _DummyProfileColumn("city")
    state = _DummyProfileColumn("state")
    niche = _DummyProfileColumn("niche")
    followers_instagram = _DummyProfileColumn("followers_instagram")


class _DummyQuery:
    def __init__(self):
        self.filters = []

    def filter(self, expression):
        self.filters.append(expression)
        return self


def test_apply_filters_normalizes_city_and_state_aliases(monkeypatch):
    # Replace SQLAlchemy columns with deterministic dummy columns so we can inspect filters.
    monkeypatch.setattr("api.influencers.InfluencerProfile", _DummyInfluencerProfile)

    query = _DummyQuery()
    _apply_filters(
        query,
        city="CDMX",
        state="df",
        niche=None,
        min_followers=0,
        max_followers=None,
    )

    assert ("ilike", "city", "%Ciudad de Mexico%") in query.filters
    assert ("ilike", "state", "%Ciudad de Mexico%") in query.filters


def test_apply_filters_adds_niche_and_follower_range_filters(monkeypatch):
    monkeypatch.setattr("api.influencers.InfluencerProfile", _DummyInfluencerProfile)

    query = _DummyQuery()
    _apply_filters(
        query,
        city=None,
        state=None,
        niche="food",
        min_followers=1000,
        max_followers=5000,
    )

    assert ("eq", "niche", "food") in query.filters
    assert ("ge", "followers_instagram", 1000) in query.filters
    assert ("le", "followers_instagram", 5000) in query.filters
