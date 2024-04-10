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
  const totalLineUps = 1_175_353_344;

  const start = Date.now();

  const racesByHorseId = [];
  const chancesByHorseId = [];
  horses.forEach((horse) => {
    racesByHorseId[horse.id] = 0;
    chancesByHorseId[horse.id] = 0;
  });

  for (let f1 = 0; f1 < favourites.length; f1++) {
    for (let f2 = 0; f2 < favourites.length; f2++) {
      if (f1 === f2) continue;
      for (let o1 = 0; o1 < outsiders.length; o1++) {
        for (let o2 = 0; o2 < outsiders.length; o2++) {
          if (o1 === o2) continue;
          for (let u1 = 0; u1 < underdogs.length; u1++) {
            for (let u2 = 0; u2 < underdogs.length; u2++) {
              if (u1 === u2) continue;
              allLineUpsNumber++;
              if (allLineUpsNumber % 1_000_000 === 0) {
                console.log({ allLineUpsNumber });
                console.log(
                  `Estimated time remaining: ${
                    (((Date.now() - start) / allLineUpsNumber) *
                      (totalLineUps - allLineUpsNumber)) /
                    1000
                  } seconds`
                );
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
