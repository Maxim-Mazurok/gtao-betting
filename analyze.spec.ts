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
  const expectedWinsOdds = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };
  const expectedWinsAdj = {
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
  const expectedWinsGroupOdds = {
    favourites: 0,
    outsiders: 0,
    underdogs: 0,
  };
  const expectedWinsGroupAdj = {
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
      expectedWinsAdj[i + 1] += chances[i];
      expectedWinsOdds[i + 1] +=
        100 /
        convertFractionOddsToDecimal(
          lineUp[i].oddsNumerator,
          lineUp[i].oddsDenominator
        ) /
        100;

      expectedWinsGroupAdj[lineUp[i].group] += chances[i];
      expectedWinsGroupOdds[lineUp[i].group] +=
        100 /
        convertFractionOddsToDecimal(
          lineUp[i].oddsNumerator,
          lineUp[i].oddsDenominator
        ) /
        100;
    }
  }

  console.log("\nactual wins by Nth fav:");
  console.log(Object.values(winners).join("\n"));
  console.log("\nexp wins by odds:");
  console.log(Object.values(expectedWinsOdds).join("\n"));
  console.log("\nexp wins adj:");
  console.log(Object.values(expectedWinsAdj).join("\n"));

  console.log("\nactual wins:");
  console.log(Object.values(winnerGroup).join("\n"));
  console.log("\nexp wins by odds:");
  console.log(Object.values(expectedWinsGroupOdds).join("\n"));
  console.log("\nexp wins adj:");
  console.log(Object.values(expectedWinsGroupOdds).join("\n"));
});
