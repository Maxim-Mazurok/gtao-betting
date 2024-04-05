import { LineUp } from ".";

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
  type: "proportionate" | "first-horse" | "equal" = "proportionate"
): number[] => {
  const decimalOdds = lineUp.map((horse) =>
    convertFractionOddsToDecimal(horse.oddsNumerator, horse.oddsDenominator)
  );
  const oddsChances = decimalOdds.map((odds) => 100 / odds);
  if (type === "proportionate") return adjustChancesProportionally(oddsChances);
  if (type === "first-horse") return adjustChancesToFirstHorse(oddsChances);
  if (type === "equal") return adjustChancesEqually(oddsChances);
  throw new Error("Invalid type");

  // const adjustedChances =
  //   adjustGoodChancesToFirstHorseAndBadChancesToLast(oddsChances);
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
