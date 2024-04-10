// see https://docs.google.com/spreadsheets/d/1z27GEyrFVnBBZcCJ-w2QDZS9LKDiZfK2wvD02UxifzE/edit#gid=1973272049

import { getHorses } from "./fs-utils";
import { calculateChances, convertFractionOddsToDecimal } from "./utils";

const main = async () => {
  const horses = await getHorses();
  const favourites = horses.filter((horse) => horse.group === "favourites");
  const outsiders = horses.filter((horse) => horse.group === "outsiders");
  const underdogs = horses.filter((horse) => horse.group === "underdogs");
  // console.log({ favourites, outsiders, underdogs });
  const allLineUps1: any[] = [];
  const allLineUps2: any[] = [];
  let allLineUpsNumber = 0;

  const racesByHorseId = [];
  const chancesByHorseId = [];
  horses.forEach((horse) => {
    racesByHorseId[horse.id] = 0;
    chancesByHorseId[horse.id] = 0;
  });

  for (let f1 = 0; f1 < favourites.length; f1++) {
    for (let f2 = f1 + 1; f2 < favourites.length; f2++) {
      for (let o1 = 0; o1 < outsiders.length; o1++) {
        for (let o2 = o1 + 1; o2 < outsiders.length; o2++) {
          for (let u1 = 0; u1 < underdogs.length; u1++) {
            for (let u2 = u1 + 1; u2 < underdogs.length; u2++) {
              allLineUpsNumber++;
              if (allLineUpsNumber % 1_000_000 === 0) {
                console.log({ allLineUpsNumber });
              }
              [
                favourites[f1],
                favourites[f2],
                outsiders[o1],
                outsiders[o2],
                underdogs[u1],
                underdogs[u2],
              ].forEach((horse) => {
                racesByHorseId[horse.id]++;
              });
              const lineUp = [
                favourites[f1],
                favourites[f2],
                outsiders[o1],
                outsiders[o2],
                underdogs[u1],
                underdogs[u2],
              ];
              const chances = calculateChances(lineUp);
              lineUp.forEach((horse) => {
                chancesByHorseId[horse.id] += chances[lineUp.indexOf(horse)];
              });
            }
          }
        }
      }
    }
  }
  console.log({
    allLineUpsNumber,
    racesByHorseId,
    chancesByHorseId,
  });

  horses.forEach((horse) => {
    // const expectedReturnRate =
    const expectedWins = chancesByHorseId[horse.id] / racesByHorseId[horse.id];

    const expectedReturnRate =
      convertFractionOddsToDecimal(horse.oddsNumerator, horse.oddsDenominator) *
      expectedWins;

    console.log(expectedReturnRate);
  });
};

main();
