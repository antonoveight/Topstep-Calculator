# Asia macros and Quarterly Theory

Research and implementation: 31 October 2026.

## Asia macro windows

The two added observation windows use New York local civil time:

| App code | New York | Vietnam during EDT | Vietnam during EST |
| --- | --- | --- | --- |
| AS1 | 18:50–19:10 | 05:50–06:10 next day | 06:50–07:10 next day |
| AS2 | 19:50–20:10 | 06:50–07:10 next day | 07:50–08:10 next day |

Primary recording: [ICT 2024 Mentorship, 4 October 2024](https://www.youtube.com/watch?v=qcYYm1iNCIM&t=4680s),
particularly 01:18–01:25. The first window and the preference for the later
window appear in the spoken discussion. The wording was checked against the
[archived transcript of that recording](https://info.quagmyre.com/xwiki/bin/view/Forex/The-Inner-Circle-Trader/ICT-Youtube-Series-2024/ICT-YT-2024-10-04-ICT-2024-Mentorship-Lecture-39/).
AS1/AS2 are app labels; this does not claim an exhaustive official Asia schedule
or equate the windows with an entire Asian session/kill zone. No additional
hourly macro windows are inferred.

The two entries participate in the existing timeline, details, highlight/search,
active status and opt-in notification paths. No notification permission is
requested automatically. Existing London/New York window definitions remain.

## Quarterly Theory research

Quarterly Theory is attributed to Daye. The implemented intraday convention is
described by the collaborating tool author in
[Daye Quarterly Theory by toodegrees](https://www.tradingview.com/script/n2aeO1GB-Daye-Quarterly-Theory-by-toodegrees/).
This is the published description, not copied indicator source code. Its release
notes anchor daily and smaller cycles to 18:00 New York. Daye's own explanation
of True Open is also available in the
[archived 30 June 2023 post](https://en.rattibha.com/storage/pdf/557324_1.pdf):
the beginning of Q2 of the relevant cycle is its True Open.

| Daily quarter | NY civil-time interval | Four 90-minute quarters begin |
| --- | --- | --- |
| Q1 / Asia | 18:00–00:00 | 18:00, 19:30, 21:00, 22:30 |
| Q2 / London | 00:00–06:00 | 00:00, 01:30, 03:00, 04:30 |
| Q3 / NY AM | 06:00–12:00 | 06:00, 07:30, 09:00, 10:30 |
| Q4 / NY PM | 12:00–18:00 | 12:00, 13:30, 15:00, 16:30 |

Each 90-minute block divides into four 22.5-minute micro quarters. Thus 18:00's
micro boundaries are 18:00, 18:22:30, 18:45 and 19:07:30. Half-minute precision
is retained. True Day Open is midnight NY; True Session Opens are 19:30, 01:30,
07:30 and 13:30 NY. Micro True Open is 22.5 minutes into its 90-minute block.

These are theoretical time partitions, not exchange opening hours. The UI
does not label current price action as accumulation/manipulation/distribution
merely because a clock quarter has changed. It supplies context to the user's
existing bias, CRT/FRVP and entry conditions; it does not replace them, force
a checklist state, or produce a buy/sell decision.

## Implemented scope and use

Enable **Quarterly Theory** beside the ICT macro toggle on Market Hours.
It is off by default, persists in the current browser and is independent of
the macro toggle. It adds two aligned rows (daily 6h quarters and session 90m
quarters), time markers for True Opens, and a context panel with current daily,
90-minute and micro quarters. Scrubbing the existing timeline previews the
same context; reset returns to the live clock.

The context panel shows True Open **timestamps**, including the local date.
The application has no OHLC price feed; it does not invent the corresponding
opening prices or draw price levels. Those remain chart references. Weekly,
monthly and yearly partitions, SMT comparison and automatic range detection
are outside this initial intraday implementation. Calendar conventions at
those scales need separate decisions, including Friday and fifth-week treatment.

## Time handling

[NIST's DST rules](https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst)
give the 2026 US transition dates as 8 March and 1 November. The app uses IANA
`America/New_York`, not a permanent UTC−5 or UTC−4 offset. Each macro/cycle
boundary is converted at its own event instant for the selected local day.
This avoids applying the post-transition offset to Asia windows that already
occurred earlier that morning in Vietnam. Midnight splits are clipped to the
displayed day; nonexistent NY spring-forward macro times are omitted.

QT subdivisions follow New York wall-clock labels; actual elapsed durations
can differ during the Sunday DST jump/repeated hour. No exchange trading
calendar or holiday verification is implied by these time bands.

## Validation

- `node tests/market-cycles.cjs`: summer/winter, both DST transition dates,
  exclusive endpoints, full-day 6h/90m coverage across five time zones, micro
  boundaries/True Opens and deduplicated Asia notifications.
- `node tests/market-cycles-browser.cjs`: active Asia markers/table, independent
  toggles, time zone changes, timeline scrubbing/reset, persistence, responsive
  dark/light modes and unchanged account data.
- Existing desk and financial regression checks remain applicable.
