import { readFile } from "fs/promises";
import { Horse, LineUp } from ".";
import { DataSource } from "./utils";

export const getHistoricalData = async (
  type: DataSource
): Promise<
  {
    lineUp: LineUp;
    winner: Horse;
  }[]
> => {
  if (type === "all") {
    return Promise.all([
      getHistoricalData("1st"),
      getHistoricalData("3rd"),
    ]).then(([data1, data3]) => [...data1, ...data3]);
  }

  const horses = await getHorses();

  const lineUpsFile = await readFile(
    `./automation/bet_on_${type}_fav_line_up_log.csv`,
    "utf-8"
  );
  const lineUps: LineUp[] = lineUpsFile
    .split(/\n|\r\n/)
    .filter(Boolean)
    .map((line) => {
      const [
        horse1Id,
        _horse1Name,
        _horse1Odds,
        horse2Id,
        _horse2Name,
        _horse2Odds,
        horse3Id,
        _horse3Name,
        _horse3Odds,
        horse4Id,
        _horse4Name,
        _horse4Odds,
        horse5Id,
        _horse5Name,
        _horse5Odds,
        horse6Id,
        _horse6Name,
        _horse6Odds,
      ] = line.split(",");
      const horse1 = horses[parseInt(horse1Id)];
      const horse2 = horses[parseInt(horse2Id)];
      const horse3 = horses[parseInt(horse3Id)];
      const horse4 = horses[parseInt(horse4Id)];
      const horse5 = horses[parseInt(horse5Id)];
      const horse6 = horses[parseInt(horse6Id)];
      return [horse1, horse2, horse3, horse4, horse5, horse6];
    });

  const resultsFile = await readFile(
    `./automation/bet_on_${type}_fav_results_log.csv`,
    "utf-8"
  );
  const results: [Horse, Horse, Horse][] = resultsFile
    .split(/\n|\r\n/)
    .filter(Boolean)
    .map((line) => {
      const [
        place1Id,
        _place1Name,
        _place1Odds,
        place2Id,
        _place2Name,
        _place2Odds,
        place3Id,
        _place3Name,
        _place3Odds,
      ] = line.split(",");
      const place1 = horses[parseInt(place1Id)];
      const place2 = horses[parseInt(place2Id)];
      const place3 = horses[parseInt(place3Id)];
      return [place1, place2, place3];
    });
  const winners = results.map((result) => result[0]);

  // verify that podium is in the lineUp
  for (let i = 0; i < lineUps.length; i++) {
    for (let j = 0; j < 3; j++) {
      if (!lineUps[i].includes(results[i][j])) {
        throw new Error(`result #${j} not in lineUp ${i}`);
      }
    }
  }

  return lineUps.map((lineUp, i) => ({
    lineUp,
    winner: results[i][0],
  }));
};

export const getHistoricalBalanceData = async (
  type: DataSource
): Promise<
  {
    balance: number;
    dateTime: string;
  }[]
> => {
  if (type === "all") {
    return Promise.all([
      getHistoricalBalanceData("1st"),
      getHistoricalBalanceData("3rd"),
    ]).then(([data1, data3]) => [...data1, ...data3]);
  }

  const data = await readFile(
    `./automation/bet_on_${type}_fav_log.csv`,
    "utf-8"
  );
  const dataArr = data
    .split(/\n|\r\n/)
    .filter(Boolean)
    .map((line) => {
      const [balance, dateTime] = line.split(",");
      return {
        balance: Number(balance),
        dateTime: dateTime.replaceAll('"', ""),
      };
    });

  return dataArr;
};

export const getHorses = async (): Promise<Array<Horse & { id: number }>> => {
  const horsesTxt = await readFile("./horses.txt", "utf-8");
  const parseHorse = (horse: string): Horse => {
    const name = horse.split(",")[0].trim();
    const originalOdds = horse.split(",")[1].trim();
    const fractionOdds = originalOdds === "EVENS" ? "1/1" : originalOdds;
    const oddsNumerator = parseInt(fractionOdds.split("/")[0]);
    const oddsDenominator = parseInt(fractionOdds.split("/")[1]);

    const group =
      oddsNumerator <= 5
        ? "favourites"
        : oddsNumerator <= 15
        ? "outsiders"
        : "underdogs";

    return {
      name,
      oddsNumerator,
      oddsDenominator,
      group,
    };
  };
  const horses = horsesTxt
    .split(/\n|\r\n/)
    .map((line, index) => ({ ...parseHorse(line), id: index }));
  return horses;
};
