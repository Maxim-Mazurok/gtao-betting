# [WIP] GTA 5 Online Betting Strategy

Testing strategies of betting on horse races in GTA Online. Calculating adjusted advantage compared to the odds and using Kelly Criterion to determine bet size, then simulating games.

Also automates betting in the game using python. Game is expected to run in Windowed mode with 1280x1024 resolution and English language.

Both are working, but still work in progress.

## Getting Started

1. `git clone https://github.com/Maxim-Mazurok/gtao-betting`
1. `cd gtao-betting`

### Simulation

1. `nvm i` - optional
1. `npm ci`
1. `npm test`

### Automation

1. `cd automation`
1. `pip install -r requirements.txt`
1. `python main.py`

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

## Notes

- Seems like the game doesn't actually use suggested chances adjustments. For example, for 371 games, the average adjusted odds for evens were 48% but the actual win rate of evens was 65%, see [Podium Frequency Chart - 2](https://docs.google.com/spreadsheets/d/1z27GEyrFVnBBZcCJ-w2QDZS9LKDiZfK2wvD02UxifzE/edit#gid=384889435)
- It looks like `adjustChancesToFirstHorse` + `getXthFavourite(0)` results in Adjusted Expected Wins to follow Actual Wins. But it doesn't work with `getBetKelly`, so maybe I figured out how to calculate odds for the first best horse, but not for the rest. Maybe try a strategy that re-allocates chances per group?
  - It seems like who you bet on will affect the winner. Need to run actual tests
    - Ran tests betting on the 3rd fav. It did win much, but it did shift odds for the 2nd category (3rd and 4th faves) from the 1st category (1st and 2nd faves). When simulating 1st fav strategy on that data - it ends up loosing a lot, unlike when testing on the fav 1st data.

## ToDo

- [ ] Try calculating average adjusted odds for each horse based on all possible combinations in the game? Doesn't make much sense tho because the adjustment doesn't seem to be used by the game
