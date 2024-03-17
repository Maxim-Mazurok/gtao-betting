// see https://docs.google.com/spreadsheets/d/1z27GEyrFVnBBZcCJ-w2QDZS9LKDiZfK2wvD02UxifzE/edit#gid=380185017

// results: { winners: 9624253, losers: 9629697, winnersPercentage: 49.99 }

const initValues = {
  balance: 100,
  bet: 1,
};

let { balance, bet } = initValues;

const reset = () => {
  balance = 100;
  bet = 1;
};

const flipACoin = () => {
  return Math.random() > 0.5 ? "heads" : "tails";
};

let bestWinner = -Infinity;
let worstLoser = Infinity;

let winners = 0;
let losers = 0;

const haveMoney = () => balance > 0;
const haveDoubled = () => balance >= initValues.balance * 2;

let lastLog = Date.now();

const possiblyEndGame = () => {
  if (haveMoney() && !haveDoubled()) return;

  bestWinner = Math.max(bestWinner, balance);
  worstLoser = Math.min(worstLoser, balance);

  if (!haveMoney()) {
    losers++;
  } else if (haveDoubled()) {
    winners++;
  } else {
    throw new Error("This should never happen");
  }

  reset();

  if (Date.now() - lastLog < 100) return;
  lastLog = Date.now();

  console.log({
    winners,
    losers,
    winnersPercentage: Math.round((winners / (winners + losers)) * 10000) / 100,
    // bestWinner,
    // worstLoser,
  });
  // console.log(`${winners},${losers}`); // for csv

  // if (winners + losers === 10_000) {
  //   process.exit(0);
  // }
};

const playRound = () => {
  if (bet < 1) throw new Error(`You are betting ${bet}`);
  if (bet > balance)
    throw new Error(`You are betting ${bet} but you have ${balance}`);
  if (balance <= 0) throw new Error(`You have lost with balance ${balance}`);
  if (balance >= initValues.balance * 2)
    throw new Error(`You have won with balance ${balance}`);

  const result = flipACoin();
  if (result === "heads") {
    balance += bet;
    bet = 1;
  } else {
    balance -= bet;
    bet = Math.min(bet * 2, balance);
  }
};

while (true) {
  playRound();
  possiblyEndGame();
}
