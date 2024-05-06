import { Horse, LineUp } from ".";
import { getHistoricalData } from "./fs-utils";
import { calculateChances, convertFractionOddsToChance } from "./utils";

const GROUP_BY_N_FIRST_HORSES = 2;

(async () => {
  const historicalData = await getHistoricalData("all");
  const lineUpWins = new Map<
    string,
    {
      lineUp: LineUp;
      winner: Horse;
      chances: number[];
    }[]
  >();
  for (let i = 0; i < historicalData.length; i++) {
    const lineUp = historicalData[i].lineUp;
    const lineUpSorted = [...lineUp].sort(
      (a, b) => a.oddsNumerator - b.oddsNumerator
    );
    const lineUpOddsString = lineUpSorted
      .slice(0, GROUP_BY_N_FIRST_HORSES)
      .map((horse) => horse.oddsNumerator)
      .join(", ");
    if (!lineUpWins.has(lineUpOddsString)) {
      lineUpWins.set(lineUpOddsString, []);
    }
    lineUpWins.set(
      lineUpOddsString,
      lineUpWins.get(lineUpOddsString).concat({
        ...historicalData[i],
        chances: calculateChances(lineUpSorted),
      })
    );
  }
  const lineUpWinsSorted = [...lineUpWins.entries()].sort(
    ([, a], [, b]) => b.length - a.length
  );
  // console.log(JSON.stringify(lineUpWinsSorted, null, 2));
  for (let [lineUpOddsString, lineUpWins] of lineUpWinsSorted) {
    const actualWins = new Array(6).fill(0);
    let expectedChances = new Array(6).fill(0);

    let totalOddsChancesSurplus = 0;

    for (let { lineUp, winner, chances } of lineUpWins) {
      const lineUpSorted = [...lineUp].sort(
        (a, b) => a.oddsNumerator - b.oddsNumerator
      );
      const winnerIndex = lineUpSorted.findIndex(
        (horse) => horse.name === winner.name
      );
      actualWins[winnerIndex]++;

      expectedChances = expectedChances.map((chance, i) => {
        return (chance + chances[i]) / 2;
      });

      totalOddsChancesSurplus +=
        lineUp.reduce(
          (a, b) =>
            a + convertFractionOddsToChance(b.oddsNumerator, b.oddsDenominator),
          0
        ) - 1;
    }
    const actualChances = actualWins
      .map((wins) => wins / lineUpWins.length)
      .map((chance) => Math.round(chance * 100));

    console.log(
      lineUpOddsString,
      `based on ${
        lineUpWins.length
      } games, total odds chances surplus: ${Math.round(
        totalOddsChancesSurplus
      )}`
    );
    console.log(
      "Expected chances:     ",
      expectedChances
        .map((chance) => Math.round(chance * 100))
        .map((x) => x.toString().padStart(3, " "))
        .join(" ")
    );
    console.log(
      "Actual chances:       ",
      actualChances.map((x) => x.toString().padStart(3, " ")).join(" ")
    );
    const expectedActualDiffs = expectedChances.map((chance, i) =>
      Math.abs(chance * 100 - actualChances[i])
    );
    console.log(
      "Expected-Actual diff: ",
      expectedActualDiffs
        .map((x) => Math.round(x))
        .map((x) => x.toString().padStart(3, " "))
        .join(" "),
      `TOTAL: ${Math.round(expectedActualDiffs.reduce((a, b) => a + b, 0))}`
    );
  }
})();
