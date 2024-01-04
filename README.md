# [WIP] GTA 5 Online Betting Strategy

Testing strategies of betting on horse races in GTA Online. Calculating adjusted advantage compared to the odds and using Kelly Criterion to determine bet size, then simulating games.

## Getting Started

1. `git clone ...`
1. `cd ...`
1. `nvm i`
1. `npm ci`
1. `npx vitest`

See also my personal spreadsheet: https://docs.google.com/spreadsheets/d/1z27GEyrFVnBBZcCJ-w2QDZS9LKDiZfK2wvD02UxifzE/edit?usp=sharing

## Credits & Prior Art

- https://www.reddit.com/r/gtaonline/comments/ciuz70/ultimate_gambling_guide_for_gta_online_odds/
- https://www.reddit.com/r/gtaonline/comments/f7d00v/horse_betting_calc/
- https://www.reddit.com/r/gtaonline/comments/ckcavz/insidetrack_monte_carlo_simulation_best_betting/
- https://www.reddit.com/r/gtaonline/comments/cjwhhe/i_made_a_calculator_to_check_if_the_horse_betting/
- https://www.reddit.com/r/gtaonline/comments/m8ltd4/big_data_collection_on_horse_racing_inside_track/ - seems to confirm horses distribution from the [horses.txt](./horses.txt) at first glance
- https://www.youtube.com/watch?v=N6tpA2iiihs
- https://docs.google.com/spreadsheets/d/1_SNaIFYstqPOcoGnXIHDIxm1xu_I98QDepUyHZwDgBY/edit - wrong "Adjusted advantage" calculation, can be negative in edge cases
- https://docs.google.com/spreadsheets/d/1P0aQr-S4cshuxagh8JJ0TK6kU9GjDTGIRBuxM7D42vs/edit - more correct, but complicated "Final Adjusted Odds %" calculations, in my spreadsheet I just use one simple formula for proportional adjustment, seems to produce very similar results to this one
- https://gta.fandom.com/wiki/Inside_Track - sourced horses list from here
