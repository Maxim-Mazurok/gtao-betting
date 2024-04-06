import { getHistoricalData, getHorses } from "./fs-utils";
import {
  calculateChances,
  convertFractionOddsToDecimal,
  determineWinner,
  generateLineUp,
} from "./utils";

export type Horse = {
  name: string;
  oddsNumerator: number;
  oddsDenominator: number;
  group: "favourites" | "outsiders" | "underdogs";
};

export const convertFractionOddsToPercentage = (
  oddsNumerator: number,
  oddsDenominator: number
): number => {
  return oddsDenominator / (oddsNumerator + oddsDenominator);
};

export type LineUp = Horse[];

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

type getBet = (
  lineUp: LineUp,
  currentMoney: number
) => { horse: Horse; amount: number };

const playGame = (
  getBet: getBet,
  currentMoney: number,
  horses: Horse[],
  overrides?: { lineUp: LineUp; winner: Horse }
): number => {
  const lineUp = overrides?.lineUp ?? generateLineUp(horses);
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

export const convertScientificNotationNumber = (value: number): string => {
  const decimalsPart = value?.toString()?.split(".")?.[1] || "";
  const eDecimals = Number(decimalsPart?.split("e-")?.[1]) || 0;
  const countOfDecimals = decimalsPart.length + eDecimals;
  return Number(value).toFixed(countOfDecimals);
};

export const getBetKelly =
  (log = false) =>
  (lineUp: LineUp, currentMoney: number) => {
    const kellyCriterion = (decimalOdds: number, actualProbability: number) =>
      (decimalOdds * actualProbability - 1) / (decimalOdds - 1);

    const chances = calculateChances(lineUp);
    const kellyCriterions = chances.map((chance, i) => {
      // if (chance === 0) return -Infinity;
      return kellyCriterion(
        convertFractionOddsToDecimal(
          lineUp[i].oddsNumerator,
          lineUp[i].oddsDenominator
        ),
        chance
      );
    });

    const maxKellyCriterion = Math.max(...kellyCriterions);
    const maxKellyCriterionIndex = kellyCriterions.indexOf(maxKellyCriterion);
    const horse = lineUp[maxKellyCriterionIndex];
    const adjustedChance = chances[maxKellyCriterionIndex];

    log &&
      console.log(
        `${convertScientificNotationNumber(
          maxKellyCriterion
        )},${convertScientificNotationNumber(
          adjustedChance
        )},${convertScientificNotationNumber(
          convertFractionOddsToPercentage(
            horse.oddsNumerator,
            horse.oddsDenominator
          )
        )}`
      );

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

export const getXthFavourite =
  (
    x = 0,
    log = false,
    chanceType: "proportionate" | "first-horse" | "equal" = "proportionate"
  ) =>
  (lineUp: LineUp) => {
    const favourite = lineUp.sort(
      (a, b) =>
        convertFractionOddsToDecimal(a.oddsNumerator, a.oddsDenominator) -
        convertFractionOddsToDecimal(b.oddsNumerator, b.oddsDenominator)
    )[x];
    const amount = 10_000;
    // console.log(lineUp, favourite);

    const chances = calculateChances(lineUp, chanceType);
    const adjustedChance = chances[lineUp.indexOf(favourite)];
    const odds = convertFractionOddsToPercentage(
      favourite.oddsNumerator,
      favourite.oddsDenominator
    );
    log && console.log([odds, adjustedChance].join(","));

    return {
      horse: favourite,
      amount,
    };
  };

export const main = async (getBet: getBet, showBalance = false) => {
  const historicalData = await getHistoricalData("1st");
  const horses = await getHorses();
  // const historicalData = shuffle(await getHistoricalData());
  const totalGames = historicalData.length ?? 50;
  const startingMoney = 10_000_000;
  let currentMoney = startingMoney;

  showBalance && console.log(currentMoney);
  for (let i = 0; i < totalGames; i++) {
    const result = playGame(getBet, currentMoney, horses, historicalData[i]);
    currentMoney += result;
    // console.log(result);
    showBalance && console.log(currentMoney);
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

// (async () => {
//   // console.log("\n\n\nkelly -----------------------------------------------")
//   await main(getBetKelly(false));
//   // console.log("\n\n\nfavourite -----------------------------------------------")
//   // await main(getXthFavourite(0));
//   // console.log("\n\n\n2nd favourite -----------------------------------------------")
//   // await main(getXthFavourite(1));
//   // console.log("\n\n\n3rd favourite -----------------------------------------------")
//   // await main(getXthFavourite(2));
//   // console.log("\n\n\n4th favourite -----------------------------------------------")
//   // await main(getXthFavourite(3));
//   // console.log("\n\n\n5th favourite -----------------------------------------------")
//   // await main(getXthFavourite(4));
//   // console.log("\n\n\n6th favourite -----------------------------------------------")
//   // await main(getXthFavourite(5));
// })();
