// see https://docs.google.com/spreadsheets/d/1z27GEyrFVnBBZcCJ-w2QDZS9LKDiZfK2wvD02UxifzE/edit#gid=1973272049

import { getHorses } from "./fs-utils";
import { calculateChances, convertFractionOddsToDecimal } from "./utils";

function perm(n: number, k: number) {
  let result = 1;
  for (let i = 0; i < k; i++) {
    result *= n - i;
  }
  return result;
}

const preCalculatedResults = {
  allLineUpsNumber: 1175353344,
  racesByHorseId: [
    69138432, 69138432, 69138432, 73459584, 69138432, 73459584, 71233536,
    73459584, 71233536, 69138432, 69138432, 73459584, 71233536, 69138432,
    71233536, 73459584, 73459584, 73459584, 71233536, 69138432, 69138432,
    69138432, 73459584, 73459584, 73459584, 71233536, 71233536, 71233536,
    73459584, 73459584, 69138432, 69138432, 69138432, 73459584, 73459584,
    71233536, 73459584, 69138432, 69138432, 71233536, 71233536, 69138432,
    71233536, 73459584, 71233536, 73459584, 71233536, 71233536, 71233536,
    71233536, 71233536, 73459584, 73459584, 69138432, 69138432, 69138432,
    69138432, 73459584, 69138432, 71233536, 71233536, 71233536, 69138432,
    73459584, 73459584, 69138432, 69138432, 71233536, 69138432, 71233536,
    73459584, 73459584, 71233536, 71233536, 69138432, 69138432, 69138432,
    73459584, 71233536, 69138432, 73459584, 73459584, 69138432, 71233536,
    71233536, 73459584, 69138432, 73459584, 71233536, 69138432, 69138432,
    71233536, 73459584, 73459584, 69138432, 73459584, 71233536, 71233536,
    71233536,
  ],
  chancesByHorseId: [
    2991456.6229963913, 2800154.1796718654, 4792101.275396179,
    5725947.669001559, 4319379.616729472, 10621297.881617608,
    26875546.052439753, 6922418.085825111, 16510983.645557066,
    3210814.8082682984, 2892645.950714024, 8042788.402580093,
    22229800.164696235, 3762628.8116650023, 22229800.16468993,
    10621297.881617645, 9595824.873752095, 8750936.916644583,
    16510983.645562725, 3607626.138585445, 3097256.6487380234,
    4543477.377913988, 11892199.443629134, 10621297.881617596,
    6471657.968182295, 18949998.10767821, 16510983.645552717, 33967926.96253043,
    9595824.873752097, 6076009.452914675, 3931549.008761317, 2713393.9518408403,
    3333016.921424048, 6922418.085825138, 8750936.916644664, 22229800.164663743,
    8042788.402580104, 3464889.0025933697, 4319379.616729472,
    26875546.052450556, 18949998.107690178, 3464889.0025933697,
    26875546.052438986, 6471657.968182338, 33967926.9625023, 6076009.452914604,
    22229800.16466255, 33967926.96247646, 22229800.164638046,
    16510983.645573882, 26875546.052450925, 5725947.669001684,
    9595824.873752046, 3097256.648738024, 3607626.138585445, 4116349.3331576735,
    4116349.3331576735, 10621297.881617757, 2713393.9518408407,
    18949998.10767597, 26875546.052464716, 16510983.645539323,
    4792101.2753961785, 5725947.669001638, 8750936.916644635, 2892645.950714024,
    2800154.1796718654, 22229800.1646734, 3210814.808268299, 18949998.107666034,
    6922418.085825105, 11892199.443629017, 18949998.107675496,
    33967926.96246415, 4543477.377913988, 2713393.9518408407, 3097256.648738024,
    6471657.9681823, 33967926.96246922, 2991456.6229963913, 11892199.443629017,
    5725947.669001593, 2713393.9518408407, 33967926.96247598,
    18949998.107679013, 6471657.968182203, 3333016.9214240485,
    8042788.402580039, 26875546.052426327, 3762628.811665002,
    3931549.0087613175, 33967926.96251088, 6922418.085825111, 6076009.452914625,
    3762628.811665002, 9595824.87375193, 26875546.05242997, 22229800.164703224,
    16510983.645554682,
  ],
};

const main = async (params: { usePreCalculatedResults: boolean }) => {
  const horses = await getHorses();
  const favourites = horses.filter((horse) => horse.group === "favourites");
  const outsiders = horses.filter((horse) => horse.group === "outsiders");
  const underdogs = horses.filter((horse) => horse.group === "underdogs");

  const favPerm = perm(favourites.length, 2);
  const outPerm = perm(outsiders.length, 2);
  const undPerm = perm(underdogs.length, 2);
  const totalLineUps = favPerm * outPerm * undPerm; // should be 1_175_353_344 permutations, not 146_919_168 combinations; though returns seem to be the same in both cases...

  const allLineUps1: any[] = [];
  const allLineUps2: any[] = [];
  let allLineUpsNumber = 0;

  const start = Date.now();

  const racesByHorseId = [];
  const chancesByHorseId = [];

  if (!params.usePreCalculatedResults) {
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
  } else {
    allLineUpsNumber = preCalculatedResults.allLineUpsNumber;
    chancesByHorseId.push(...preCalculatedResults.chancesByHorseId);
    racesByHorseId.push(...preCalculatedResults.racesByHorseId);
  }

  horses.forEach((horse) => {
    const expectedWinRate =
      chancesByHorseId[horse.id] / racesByHorseId[horse.id];

    const expectedReturnRate =
      convertFractionOddsToDecimal(horse.oddsNumerator, horse.oddsDenominator) *
      expectedWinRate;

    console.log(horse.oddsNumerator, expectedReturnRate);
  });
};

main({
  usePreCalculatedResults: true,
});
