import Chart from "chart.js/auto";
import { getHistoricalData } from "../fs-utils";
import {
  calculateChances,
  convertFractionOddsToChance,
  convertFractionOddsToDecimal,
  sortByOdds,
} from "../utils";

const doIt = async (
  chartCtx: HTMLCanvasElement,
  historyType: "1st" | "3rd",
  groupType: "horse" | "group"
) => {
  const response = await fetch(`/api/historical-data?type=${historyType}`);
  const historicalData = (await response.json()) as Awaited<
    ReturnType<typeof getHistoricalData>
  >;
  const data = {
    actualWins: {},
    expectedWinsByOdds: {},
    adjustedWinsProportionately: {},
    adjustedWinsToFirstHorse: {},
  };

  if (groupType === "group") {
    Object.keys(data).forEach((key) => {
      data[key] = {
        favourites: 0,
        outsiders: 0,
        underdogs: 0,
      };
    });
  }

  historicalData.forEach(({ lineUp, winner }) => {
    if (groupType === "horse") {
      const sorted = sortByOdds(lineUp);
      const winnerId = sorted.findIndex(
        (horse) => JSON.stringify(horse) === JSON.stringify(winner)
      );

      data.actualWins[winnerId] = (data.actualWins[winnerId] ?? 0) + 1;

      sorted.forEach((horse, i) => {
        if (!data.expectedWinsByOdds[i]) data.expectedWinsByOdds[i] = 0;

        data.expectedWinsByOdds[i] += convertFractionOddsToChance(
          horse.oddsNumerator,
          horse.oddsDenominator
        );
      });

      const proportionateChances = calculateChances(sorted, "proportionate");
      proportionateChances.forEach((chance, i) => {
        if (!data.adjustedWinsProportionately[i])
          data.adjustedWinsProportionately[i] = 0;

        data.adjustedWinsProportionately[i] += chance;
      });

      const firstHorseChances = calculateChances(sorted, "first-horse");
      firstHorseChances.forEach((chance, i) => {
        if (!data.adjustedWinsToFirstHorse[i])
          data.adjustedWinsToFirstHorse[i] = 0;

        data.adjustedWinsToFirstHorse[i] += chance;
      });
    } else {
      data.actualWins[winner.group] += 1;

      const proportionateChances = calculateChances(lineUp, "proportionate");
      const firstHorseChances = calculateChances(lineUp, "first-horse");

      lineUp.forEach((horse, i) => {
        data.expectedWinsByOdds[horse.group] += convertFractionOddsToChance(
          horse.oddsNumerator,
          horse.oddsDenominator
        );

        data.adjustedWinsProportionately[horse.group] +=
          proportionateChances[i];
        data.adjustedWinsToFirstHorse[horse.group] += firstHorseChances[i];
      });
    }
  });

  new Chart(chartCtx, {
    type: "bar",
    data: {
      labels: Object.keys(data.actualWins).map((x) =>
        groupType === "group" ? x : Number(x) + 1
      ),
      datasets: [
        {
          label: "Actual Wins",
          data: Object.values(data.actualWins) as number[],
          borderColor: "blue",
          backgroundColor: "blue",
        },
        {
          label: "Adjusted Wins To First Horse",
          data: Object.values(data.adjustedWinsToFirstHorse) as number[],
          borderColor: "red",
          backgroundColor: "red",
        },
        {
          label: "Adjusted Wins Proportionately",
          data: Object.values(data.adjustedWinsProportionately) as number[],
          borderColor: "orange",
          backgroundColor: "orange",
        },
        {
          label: "Expected Wins By Odds",
          data: Object.values(data.expectedWinsByOdds) as number[],
          borderColor: "green",
          backgroundColor: "green",
        },
      ],
    },
  });
};

const ctx1 = document.getElementById("chart1") as HTMLCanvasElement;
const ctx2 = document.getElementById("chart2") as HTMLCanvasElement;
const ctx3 = document.getElementById("chart3") as HTMLCanvasElement;
const ctx4 = document.getElementById("chart4") as HTMLCanvasElement;

doIt(ctx1, "1st", "horse");
doIt(ctx2, "3rd", "horse");
doIt(ctx3, "1st", "group");
doIt(ctx4, "3rd", "group");
