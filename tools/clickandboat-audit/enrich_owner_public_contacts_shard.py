from __future__ import annotations

import os

import enrich_owner_public_contacts as base

SHARD_INDEX = int(os.getenv("SHARD_INDEX", "0"))
SHARD_COUNT = max(1, int(os.getenv("SHARD_COUNT", "1")))
_original_read_owners = base.read_owners


def read_owners_shard():
    owners = _original_read_owners()
    owners.sort(
        key=lambda row: (
            {"A": 0, "B": 1, "C": 2}.get(row.get("priority", "C"), 3),
            -int(float(row.get("score") or 0)),
            row.get("owner", ""),
        )
    )
    return [row for index, row in enumerate(owners) if index % SHARD_COUNT == SHARD_INDEX]


base.read_owners = read_owners_shard

if __name__ == "__main__":
    raise SystemExit(base.main())
