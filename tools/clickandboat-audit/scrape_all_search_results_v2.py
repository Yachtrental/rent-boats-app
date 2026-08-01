from __future__ import annotations

import sys

import scrape_all_search_results as app

_original_parse_card = app.parse_card


def parse_card_with_nested_link(card, page_number, position, partition):
    """Boat item-cards are divs with a nested link; activity item-cards are links."""
    if not card.get("href"):
        link = card.select_one(
            'a[href*="/es/alquiler-barcos/"], a[href*="/es/activities/"]'
        )
        if link and link.get("href"):
            card["href"] = link.get("href")
    return _original_parse_card(card, page_number, position, partition)


app.parse_card = parse_card_with_nested_link

if __name__ == "__main__":
    sys.exit(app.main())
