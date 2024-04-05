import { describe, expect, it } from "vitest";
import {
  Horse,
  calculateNetWinnings,
  convertFractionOddsToPercentage,
  getBetKelly,
  getXthFavourite,
  main,
} from ".";
import {
  adjustChancesEqually,
  adjustChancesToFirstHorse,
  adjustGoodChancesToFirstHorseAndBadChancesToLast,
  convertFractionOddsToDecimal,
} from "./utils";

it("works", async () => {
  await main(getBetKelly(false), false);
  await main(getXthFavourite(0, false), false);

  // await main(getBetKelly(false), true);
  // await main(getBetKelly(true), false);
  // await main(getXthFavourite(0), true);
  // await main(getXthFavourite(0, true, "proportionate"), false);
  // await main(getXthFavourite(0, true, "first-horse"), false);
  // await main(getXthFavourite(0, false), true);
});

it("converts odds", () => {
  expect(convertFractionOddsToPercentage(1, 1)).toBe(0.5);
  expect(convertFractionOddsToDecimal(1, 1)).toBe(2);

  expect(convertFractionOddsToPercentage(6, 1).toFixed(4)).toBe("0.1429");
  expect(convertFractionOddsToDecimal(6, 1)).toBe(7);

  // https://www.aceodds.com/bet-calculator/odds-converter.html
  expect(convertFractionOddsToPercentage(5, 2).toFixed(3)).toBe("0.286");
  expect(convertFractionOddsToDecimal(5, 2)).toBe(3.5);
});

describe("calculates winnings", () => {
  it("winner evens", () => {
    const betHorse: Horse = {
      oddsNumerator: 1,
      oddsDenominator: 1,
      name: "even",
      group: "favourites",
    };
    const winner = betHorse;
    expect(
      calculateNetWinnings(
        {
          horse: betHorse,
          amount: 100,
        },
        winner
      )
    ).toBe(100);
  });

  it("winner 2/1", () => {
    const betHorse: Horse = {
      oddsNumerator: 2,
      oddsDenominator: 1,
      name: "2x",
      group: "favourites",
    };
    const winner = betHorse;
    expect(
      calculateNetWinnings(
        {
          horse: betHorse,
          amount: 100,
        },
        winner
      )
    ).toBe(200);
  });
  it("loser", () => {
    const betHorse: Horse = {
      oddsNumerator: 2,
      oddsDenominator: 1,
      name: "2x",
      group: "favourites",
    };
    const winner: Horse = {
      oddsNumerator: 1,
      oddsDenominator: 1,
      name: "even",
      group: "favourites",
    };
    expect(
      calculateNetWinnings(
        {
          horse: betHorse,
          amount: 100,
        },
        winner
      )
    ).toBe(-100);
  });
});

describe("adjust odds equally", () => {
  it("works for smaller", () => {
    const chances = [30, 30];
    const adjusted = adjustChancesEqually(chances);
    expect(adjusted).toMatchInlineSnapshot(`
      [
        0.5,
        0.5,
      ]
    `);
  });
  it("works for higher", () => {
    const chances = [130, 130];
    const adjusted = adjustChancesEqually(chances);
    expect(adjusted).toMatchInlineSnapshot(`
      [
        0.5,
        0.5,
      ]
    `);
  });
  it("works for very different", () => {
    const chances = [1, 98];
    const adjusted = adjustChancesEqually(chances);
    expect(adjusted).toMatchInlineSnapshot(`
      [
        0.015,
        0.985,
      ]
    `);
  });
});

describe("adjust odds to first horse", () => {
  it("works for smaller", () => {
    const chances = [30, 30];
    const adjusted = adjustChancesToFirstHorse(chances);
    expect(adjusted).toMatchInlineSnapshot(`
      [
        0.7,
        0.3,
      ]
    `);
  });
  it("works for higher", () => {
    const chances = [80, 80];
    const adjusted = adjustChancesToFirstHorse(chances);
    expect(adjusted).toMatchInlineSnapshot(`
      [
        0.2,
        0.8,
      ]
    `);
  });
  it("works for much higher", () => {
    const chances = [20, 120];
    const adjusted = adjustChancesToFirstHorse(chances);
    expect(adjusted).toMatchInlineSnapshot(`
      [
        0,
        1,
      ]
    `);
  });
  it("works for much higher", () => {
    const chances = [20, 80, 90];
    const adjusted = adjustChancesToFirstHorse(chances);
    expect(adjusted).toMatchInlineSnapshot(`
      [
        0,
        0.1,
        0.9,
      ]
    `);
  });
  it("works for very different", () => {
    const chances = [1, 98];
    const adjusted = adjustChancesToFirstHorse(chances);
    expect(adjusted).toMatchInlineSnapshot(`
      [
        0.02,
        0.98,
      ]
    `);
  });
  it("works for very different", () => {
    const chances = [12.5, 6.25, 50, 50, 4.166666667, 4.761904762];
    const adjusted = adjustChancesToFirstHorse(chances);
    expect(adjusted).toMatchInlineSnapshot(`
      [
        0,
        0,
        0.41071428570999996,
        0.5,
        0.041666666670000005,
        0.04761904762,
      ]
    `);
  });
  it("works for another different", () => {
    const horses = [
      {
        name: "Yay Yo Let's Go",
        oddsNumerator: 3,
        oddsDenominator: 1,
        group: "favourites",
      },
      {
        name: "Flipped Wig",
        oddsNumerator: 12,
        oddsDenominator: 1,
        group: "outsiders",
      },
      {
        name: "Stupid Money",
        oddsNumerator: 30,
        oddsDenominator: 1,
        group: "underdogs",
      },
      {
        name: "Tenpenny",
        oddsNumerator: 10,
        oddsDenominator: 1,
        group: "outsiders",
      },
      {
        name: "Yellow Sunshine",
        oddsNumerator: 5,
        oddsDenominator: 1,
        group: "favourites",
      },
      {
        name: "Dead Fam",
        oddsNumerator: 26,
        oddsDenominator: 1,
        group: "underdogs",
      },
    ];
    const chances = horses.map(
      (horse) =>
        100 /
        convertFractionOddsToDecimal(horse.oddsNumerator, horse.oddsDenominator)
    );
    const adjusted = adjustChancesToFirstHorse(chances);
    expect(adjusted).toMatchInlineSnapshot(`
      [
        0.5962060639479994,
        0.07692307692307693,
        0.03225806451612903,
        0.09090909090909091,
        0.16666666666666669,
        0.037037037037037035,
      ]
    `);
  });
});

describe("adjustGoodChancesToFirstHorseAndBadChancesToLast", () => {
  it("works for smaller", () => {
    const chances = [30, 30];
    const adjusted = adjustGoodChancesToFirstHorseAndBadChancesToLast(chances);
    expect(adjusted).toMatchInlineSnapshot(`
      [
        0.7,
        0.3,
      ]
    `);
  });
  it("works for higher", () => {
    const chances = [80, 80];
    const adjusted = adjustGoodChancesToFirstHorseAndBadChancesToLast(chances);
    expect(adjusted).toMatchInlineSnapshot(`
      [
        0.8,
        0.2,
      ]
    `);
  });
  it("works for much higher", () => {
    const chances = [20, 120];
    const adjusted = adjustGoodChancesToFirstHorseAndBadChancesToLast(chances);
    expect(adjusted).toMatchInlineSnapshot(`
      [
        0.2,
        0.8,
      ]
    `);
  });
  it("works for much higher", () => {
    const chances = [20, 80, 90];
    const adjusted = adjustGoodChancesToFirstHorseAndBadChancesToLast(chances);
    expect(adjusted).toMatchInlineSnapshot(`
      [
        0.2,
        0.8,
        0,
      ]
    `);
  });
  it("works for very different", () => {
    const chances = [1, 98];
    const adjusted = adjustGoodChancesToFirstHorseAndBadChancesToLast(chances);
    expect(adjusted).toMatchInlineSnapshot(`
      [
        0.02,
        0.98,
      ]
    `);
  });
});
