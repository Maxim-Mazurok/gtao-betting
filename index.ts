import { readFileSync } from "fs";

type Horse = {
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

const playGame = (
  getBet: (lineUp: LineUp) => { horse: Horse; amount: number }
): number => {
  const lineUp = generateLineUp();
  const bet = getBet(lineUp);

  if (bet.amount > 10_000) throw new Error("bet amount too high");
  if (bet.amount < 100) throw new Error("bet amount too low");
  if (bet.amount % 100 !== 0) throw new Error("bet amount not multiple of 100");
  if (bet.amount >= 1000 && bet.amount % 500 !== 0)
    throw new Error("bet amount not multiple of 500");

  // console.log(bet);
  const winner = determineWinner(lineUp);

  if (bet.horse === winner) {
    const winnings =
      bet.amount *
      convertFractionOddsToDecimal(
        bet.horse.oddsNumerator,
        bet.horse.oddsDenominator
      );
    // console.log("win", winnings);
    return winnings;
  }
  // console.log("loss", -bet.amount);
  return -bet.amount;
};

// const calculate

export const main = () => {
  const totalGames = 50;
  const startingMoney = 117_900;
  let currentMoney = startingMoney;

  const getBet = (lineUp: LineUp) => {
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

    const getAmount = () => {
      if (maxKellyCriterion <= 0) return 100;

      let amount = 0;
      const kellyAmount = Math.min(44_000, currentMoney) * maxKellyCriterion;
      amount = kellyAmount;
      // amount = Math.min(amount, 10_000);

      if (amount < 1000) amount = Math.ceil(amount / 100) * 100;
      amount = Math.ceil(amount / 500) * 500;

      return amount;
      // return Math.min(amount, 50_000);
    };

    const amount = getAmount();

    // console.log(kellyCriterions, amount);

    // return {
    //   horse: lineUp[0],
    //   amount: 1_000,
    // };

    return {
      horse,
      amount,
    };
  };

  for (let i = 0; i < totalGames; i++) {
    currentMoney += playGame(getBet);
    if (currentMoney <= 0) {
      console.log(`bankrupt in ${i} games`);
      break;
    }
  }

  console.log(
    `${startingMoney.toLocaleString()} => ${Math.round(
      currentMoney
    ).toLocaleString()}`
  );
};

// basically the goal will be to find which horse will provide the closest match in bet for Kelly Criterion
