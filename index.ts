import { readFileSync } from "fs";
import { readFile } from "fs/promises";

export type Horse = {
  name: string;
  oddsNumerator: number;
  oddsDenominator: number;
  group: "favourites" | "outsiders" | "underdogs";
};

export const convertFractionOddsToDecimal = (
  oddsNumerator: number,
  oddsDenominator: number
): number => {
  return oddsNumerator / oddsDenominator + 1;
};

export const convertFractionOddsToPercentage = (
  oddsNumerator: number,
  oddsDenominator: number
): number => {
  return oddsDenominator / (oddsNumerator + oddsDenominator);
};

type LineUp = Horse[];

const horsesTxt = readFileSync("./horses.txt", "utf-8");
const horses: Horse[] = horsesTxt.split("\n").map((horse) => {
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
});

// console.log(horses);

const generateLineUp = (): LineUp => {
  const lineUp: LineUp = [];
  const horsesOptions = [...horses];
  for (let group of ["favourites", "outsiders", "underdogs"]) {
    for (let i = 0; i < 2; i++) {
      const horsesInGroup = horsesOptions.filter(
        (horse) => horse.group === group
      );
      const randomIndex = Math.floor(Math.random() * horsesInGroup.length);
      const horse = horsesInGroup[randomIndex];
      lineUp.push(horse);
      horsesOptions.splice(horsesOptions.indexOf(horse), 1);
    }
  }
  return lineUp;
};

const calculateChances = (lineUp: LineUp): number[] => {
  const decimalOdds = lineUp.map((horse) =>
    convertFractionOddsToDecimal(horse.oddsNumerator, horse.oddsDenominator)
  );
  const oddsChances = decimalOdds.map((odds) => 100 / odds);
  const totalOddsChance = oddsChances.reduce((a, b) => a + b, 0);
  const adjustedChances = oddsChances.map((chance) => chance / totalOddsChance);

  return adjustedChances;
};

// simulate the game and randomly pick a winner based on the odds
const determineWinner = (lineUp: LineUp): Horse => {
  const chances = calculateChances(lineUp);
  const random = Math.random();
  let sum = 0;

  for (let i = 0; i < chances.length; i++) {
    sum += chances[i];
    if (random <= sum) {
      // console.log(chances, random, i);
      return lineUp[i];
    }
  }
  return lineUp[chances.length - 1];
};

export const calculateNetWinnings = (
  bet: { horse: Horse; amount: number },
  winner: Horse
) => {
  let winnings = 0;
  if (bet.horse === winner) {
    winnings =
      bet.amount *
      convertFractionOddsToDecimal(
        bet.horse.oddsNumerator,
        bet.horse.oddsDenominator
      );
  }
  return winnings - bet.amount;
};

const playGame = (
  getBet: (
    lineUp: LineUp,
    currentMoney: number
  ) => { horse: Horse; amount: number },
  currentMoney: number,
  overrides?: { lineUp: LineUp; winner: Horse }
): number => {
  const lineUp = overrides?.lineUp ?? generateLineUp();
  const bet = getBet(lineUp, currentMoney);

  if (!bet.amount) throw new Error("bet amount not defined");
  if (!bet.horse) throw new Error("bet horse not defined");
  if (bet.amount > 10_000) throw new Error("bet amount too high");
  if (bet.amount < 100) throw new Error("bet amount too low");
  if (bet.amount % 100 !== 0) throw new Error("bet amount not multiple of 100");
  if (bet.amount >= 1000 && bet.amount % 500 !== 0)
    throw new Error("bet amount not multiple of 500");

  // console.log(bet);
  const winner = overrides?.winner ?? determineWinner(lineUp);

  return calculateNetWinnings(bet, winner);
};

const getHistoricalData = async (): Promise<
  {
    lineUp: LineUp;
    winner: Horse;
  }[]
> => {
  const lineUpsFile = await readFile("./automation/line_up_log.csv", "utf-8");
  const lineUps: LineUp[] = lineUpsFile
    .split("\n")
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

  const resultsFile = await readFile("./automation/results_log.csv", "utf-8");
  const results: [Horse, Horse, Horse][] = resultsFile
    .split("\n")
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

  // verify that winner is in the lineUp
  for (let i = 0; i < lineUps.length; i++) {
    if (!lineUps[i].includes(winners[i])) {
      throw new Error(`winner not in lineUp ${i}`);
    }
  }

  return lineUps.map((lineUp, i) => ({
    lineUp,
    winner: winners[i],
  }));
};

const getBetKelly = (lineUp: LineUp, currentMoney: number) => {
  const kellyCriterion = (decimalOdds: number, actualProbability: number) =>
    (decimalOdds * actualProbability - 1) / (decimalOdds - 1);

  const chances = calculateChances(lineUp);
  const kellyCriterions = chances.map((chance, i) =>
    kellyCriterion(
      convertFractionOddsToDecimal(
        lineUp[i].oddsNumerator,
        lineUp[i].oddsDenominator
      ),
      chance
    )
  );

  const maxKellyCriterion = Math.max(...kellyCriterions);
  const maxKellyCriterionIndex = kellyCriterions.indexOf(maxKellyCriterion);
  const horse = lineUp[maxKellyCriterionIndex];
  const adjustedChance = chances[maxKellyCriterionIndex];

  // TODO: uncomment for distribution charts
  // console.log(
  //   `${maxKellyCriterion},${adjustedChance},${convertFractionOddsToPercentage(
  //     horse.oddsNumerator,
  //     horse.oddsDenominator
  //   )}`
  // );

  const getAmount = () => {
    if (maxKellyCriterion <= 0) {
      // console.log("maxKellyCriterion <= 0, ", maxKellyCriterion);
      return 100;
    }

    let amount = 0;
    // const kellyAmount = Math.min(44_000, currentMoney) * maxKellyCriterion;
    const kellyAmount = currentMoney * maxKellyCriterion;
    amount = kellyAmount;
    amount = Math.min(amount, 10_000);

    if (amount < 1_000) amount = Math.ceil(amount / 100) * 100;
    amount = Math.ceil(amount / 500) * 500;

    return amount;
    // return Math.min(amount, 50_000);
  };

  const amount = getAmount();

  return {
    horse,
    amount,
  };
};

const getXthFavourite =
  (x = 0) =>
  (lineUp: LineUp) => {
    const favourite = lineUp.sort(
      (a, b) =>
        convertFractionOddsToDecimal(a.oddsNumerator, a.oddsDenominator) -
        convertFractionOddsToDecimal(b.oddsNumerator, b.oddsDenominator)
    )[x];
    const amount = 10_000;
    // console.log(lineUp, favourite);

    return {
      horse: favourite,
      amount,
    };
  };

export const main = async () => {
  const historicalData = await getHistoricalData();
  // const historicalData = shuffle(await getHistoricalData());
  const totalGames = historicalData.length ?? 50;
  const startingMoney = 10_000_000;
  let currentMoney = startingMoney;

  // const getBet = getBetKelly; // https://docs.google.com/spreadsheets/d/1z27GEyrFVnBBZcCJ-w2QDZS9LKDiZfK2wvD02UxifzE/edit#gid=1200825551
  // const getBet = getXthFavourite(0);
  // const getBet = getXthFavourite(1);
  // const getBet = getXthFavourite(2);
  // const getBet = getXthFavourite(3);
  // const getBet = getXthFavourite(4);
  const getBet = getXthFavourite(5);

  console.log(currentMoney);
  for (let i = 0; i < totalGames; i++) {
    const result = playGame(getBet, currentMoney, historicalData[i]);
    currentMoney += result;
    // console.log(result);
    console.log(currentMoney);
    if (currentMoney <= 0) {
      console.log(`bankrupt in ${i} games`);
      break;
    }
  }

  // console.log(
  //   `${startingMoney.toLocaleString()} => ${Math.round(
  //     currentMoney
  //   ).toLocaleString()}`
  // );
};

// basically the goal will be to find which horse will provide the closest match in bet for Kelly Criterion

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

main();
