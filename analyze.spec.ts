import { it } from "vitest";
import { getHistoricalData } from "./fs-utils";
import { calculateChances, convertFractionOddsToDecimal } from "./utils";

const types = ["1st", "3rd"] as const;

types.map((type) =>
  it(`works for ${type}`, async () => {
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
    const expectedWinsAdjProp = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    };
    const expectedWinsAdjFirstHorse = {
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
    const expectedWinsGroupAdjProp = {
      favourites: 0,
      outsiders: 0,
      underdogs: 0,
    };
    const expectedWinsGroupAdjFirstHorse = {
      favourites: 0,
      outsiders: 0,
      underdogs: 0,
    };
    const historicalData = await getHistoricalData(type);
    for (let i = 0; i < historicalData.length; i++) {
      const lineUp = historicalData[i].lineUp;
      const lineUpSorted = [...lineUp].sort(
        (a, b) => a.oddsNumerator - b.oddsNumerator
      );

      const winnerIndex = lineUpSorted.findIndex(
        (horse) => horse === historicalData[i].winner
      );
      winners[winnerIndex + 1]++;
      winnerGroup[historicalData[i].winner.group]++;

      const chancesProportionate = calculateChances(lineUp);
      const chancesFirstHorse = calculateChances(lineUp, "first-horse");

      for (let i = 0; i < lineUp.length; i++) {
        expectedWinsAdjProp[i + 1] += chancesProportionate[i];
        expectedWinsAdjFirstHorse[i + 1] += chancesFirstHorse[i];
        expectedWinsOdds[i + 1] +=
          100 /
          convertFractionOddsToDecimal(
            lineUp[i].oddsNumerator,
            lineUp[i].oddsDenominator
          ) /
          100;

        expectedWinsGroupAdjProp[lineUp[i].group] += chancesProportionate[i];
        expectedWinsGroupAdjFirstHorse[lineUp[i].group] += chancesFirstHorse[i];
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
    console.log("\nexp wins adj prop:");
    console.log(Object.values(expectedWinsAdjProp).join("\n"));
    console.log("\nexp wins adj first horse:");
    console.log(Object.values(expectedWinsAdjFirstHorse).join("\n"));

    console.log("\nactual wins:");
    console.log(Object.values(winnerGroup).join("\n"));
    console.log("\nexp wins by odds:");
    console.log(Object.values(expectedWinsGroupOdds).join("\n"));
    console.log("\nexp wins adj prop:");
    console.log(Object.values(expectedWinsGroupAdjProp).join("\n"));
    console.log("\nexp wins adj first horse:");
    console.log(Object.values(expectedWinsGroupAdjFirstHorse).join("\n"));
  })
);
