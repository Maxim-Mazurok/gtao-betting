import { expect, it, describe } from "vitest";
import {
  Horse,
  adjustChancesEqually,
  calculateNetWinnings,
  convertFractionOddsToDecimal,
  convertFractionOddsToPercentage,
  getBetKelly,
  getXthFavourite,
  main,
} from ".";

it("works", async () => {
  await main(getBetKelly, false);
  await main(getXthFavourite(0), true);
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
