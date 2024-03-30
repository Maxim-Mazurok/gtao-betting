import { readFile } from "fs/promises";
import { it } from "vitest";
import {
  Horse,
  LineUp,
  calculateChances,
  convertFractionOddsToDecimal,
  getHistoricalData,
  horses,
} from ".";

it("works", async () => {
  const winners = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };
  const expectedWins = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };
  const winnerGroup = {
    favourites: 0,
    outsiders: 0,
    underdogs: 0,
  };
  const expectedWinsGroup = {
    favourites: 0,
    outsiders: 0,
    underdogs: 0,
  };
  const historicalData = await getHistoricalData();
  for (let i = 0; i < historicalData.length; i++) {
    const lineUp = historicalData[i].lineUp.sort(
      (a, b) => a.oddsNumerator - b.oddsNumerator
    );

    const winnerIndex = lineUp.findIndex(
      (horse) => horse === historicalData[i].winner
    );
    winners[winnerIndex + 1]++;
    winnerGroup[historicalData[i].winner.group]++;

    const chances = calculateChances(lineUp);

    for (let i = 0; i < lineUp.length; i++) {
      expectedWins[i + 1] += chances[i];
      // expectedWinsGroup[lineUp[i].group] += chances[i];
      expectedWinsGroup[lineUp[i].group] +=
        100 /
        convertFractionOddsToDecimal(
          lineUp[i].oddsNumerator,
          lineUp[i].oddsDenominator
        ) /
        100;
    }
  }

  console.log(winners);
  console.log(expectedWins);

  console.table(winnerGroup);
  console.table(expectedWinsGroup);
});
