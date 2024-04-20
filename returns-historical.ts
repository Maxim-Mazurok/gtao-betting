// see https://docs.google.com/spreadsheets/d/1z27GEyrFVnBBZcCJ-w2QDZS9LKDiZfK2wvD02UxifzE/edit#gid=1973272049

import { getHistoricalData, getHorses } from "./fs-utils";
import { convertFractionOddsToDecimal } from "./utils";

const main = async () => {
  const horses = await getHorses();

  const getHorseIdByName = (name: string) =>
    horses.find((h) => h.name === name).id;

  const historicalData = await getHistoricalData("all");

  let allLineUpsNumber = 0;

  const racesByHorseId = [];
  const winsByHorseId = [];

  horses.forEach((horse) => {
    racesByHorseId[horse.id] = 0;
    winsByHorseId[horse.id] = 0;
  });

  for (const { lineUp, winner } of historicalData) {
    lineUp.forEach((horse) => {
      const horseId = getHorseIdByName(horse.name);
      racesByHorseId[horseId]++;
    });
    const winnerId = getHorseIdByName(winner.name);
    winsByHorseId[winnerId]++;
    allLineUpsNumber++;
  }

  console.log({
    allLineUpsNumber,
    racesByHorseId,
    winsByHorseId,
  });

  horses.forEach((horse) => {
    const winRate = winsByHorseId[horse.id] / racesByHorseId[horse.id];

    const expectedReturnRate =
      convertFractionOddsToDecimal(horse.oddsNumerator, horse.oddsDenominator) *
      winRate;

    console.log(expectedReturnRate);
  });
};

main();
