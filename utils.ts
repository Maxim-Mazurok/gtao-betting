import { Horse, LineUp } from ".";

// 1/1 => 0.5
export const convertFractionOddsToChance = (
  oddsNumerator: number,
  oddsDenominator: number
): number => {
  return 1 / convertFractionOddsToDecimal(oddsNumerator, oddsDenominator);
};

// 1/1 => 2
export const convertFractionOddsToDecimal = (
  oddsNumerator: number,
  oddsDenominator: number
): number => {
  return oddsNumerator / oddsDenominator + 1;
};

export const calculateChances = (
  lineUp: LineUp,
  type:
    | "proportionate"
    | "first-horse"
    | "equal"
    | "odds"
    | "custom" = "proportionate"
): number[] => {
  const decimalOdds = lineUp.map((horse) =>
    convertFractionOddsToDecimal(horse.oddsNumerator, horse.oddsDenominator)
  );
  const oddsChances = decimalOdds.map((odds) => 100 / odds);
  if (type === "proportionate") return adjustChancesProportionally(oddsChances);
  if (type === "first-horse") return adjustChancesToFirstHorse(oddsChances);
  if (type === "equal") return adjustChancesEqually(oddsChances);
  if (type === "odds") return adjustChancesLikeOdds(oddsChances);
  if (type === "custom") {
    const myOddsChances = oddsChances.map((x) => (x === 50 ? 65 : x));
    const chances = adjustChancesEqually(myOddsChances);
    return chances;
  }
  throw new Error("Invalid type");

  // const adjustedChances =
  //   adjustGoodChancesToFirstHorseAndBadChancesToLast(oddsChances);
};

export const adjustChancesLikeOdds = (chances: number[]) => {
  return chances.map((x) => x / 100);
};

export const adjustChancesEqually = (chances: number[]) => {
  const totalOddsChance = chances.reduce((a, b) => a + b, 0);
  const diff = 100 - totalOddsChance;
  return chances
    .map((chance) => chance + diff / chances.length)
    .map((x) => x / 100);
};

export const adjustChancesToFirstHorse = (chances: number[]) => {
  const totalOddsChance = chances.reduce((a, b) => a + b, 0);
  let diff = 100 - totalOddsChance;
  for (let i = 0; i < chances.length; i++) {
    if (diff < 0) {
      const subtract = Math.min(-diff, chances[i]);
      chances[i] -= subtract;
      diff += subtract;
    } else {
      chances[i] += diff;
      diff = 0;
    }
  }
  return chances.map((x) => x / 100);
};

export const adjustChancesToFirstHorse2 = (chances: number[]) => {
  const totalOddsChance = chances.reduce((a, b) => a + b, 0);
  let diff = 100 - totalOddsChance;
  return chances
    .map((x) => {
      return Math.max(0, x + diff);
    })
    .map((x) => x / 100);
};

export const adjustGoodChancesToFirstHorseAndBadChancesToLast = (
  chances: number[]
) => {
  const totalOddsChance = chances.reduce((a, b) => a + b, 0);
  let diff = 100 - totalOddsChance;
  const shouldReverse = diff < 0;
  if (shouldReverse) chances = chances.reverse();
  for (let i = 0; i < chances.length; i++) {
    if (diff < 0) {
      const subtract = Math.min(-diff, chances[i]);
      chances[i] -= subtract;
      diff += subtract;
    } else {
      chances[i] += diff;
      diff = 0;
    }
  }
  if (shouldReverse) chances = chances.reverse();
  return chances.map((x) => x / 100);
};

const adjustChancesProportionally = (chances: number[]) => {
  const totalOddsChance = chances.reduce((a, b) => a + b, 0);
  return chances.map((chance) => chance / totalOddsChance);
};

export const sortByOdds = (lineUp: LineUp) => {
  return lineUp.slice().sort((a, b) => {
    const oddsA = convertFractionOddsToDecimal(
      a.oddsNumerator,
      a.oddsDenominator
    );
    const oddsB = convertFractionOddsToDecimal(
      b.oddsNumerator,
      b.oddsDenominator
    );
    return oddsA - oddsB;
  });
};

// simulate the game and randomly pick a winner based on the odds
export const determineWinner = (lineUp: LineUp): Horse => {
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

export const generateLineUp = (horses: Horse[]): LineUp => {
  const lineUp: LineUp = [];
  const horsesOptions = [...horses];
  for (let group of ["favourites", "outsiders", "underdogs"]) {
    for (let i = 0; i < 2; i++) {
      const horsesInGroup = horsesOptions.filter(
        (horse) => horse.group === group
      );
      const randomIndex = randomIntFromInterval(0, horsesInGroup.length - 1);
      const horse = horsesInGroup[randomIndex];
      lineUp.push(horse);
      horsesOptions.splice(horsesOptions.indexOf(horse), 1);
    }
  }
  return lineUp;
};

function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
