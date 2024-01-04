import { expect, it } from "vitest";
import {
  convertFractionOddsToDecimal,
  convertFractionOddsToPercentage,
  main,
} from ".";

it("works", () => {
  main();
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
