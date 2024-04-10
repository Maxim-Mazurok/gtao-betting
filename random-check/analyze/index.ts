import Chart from "chart.js/auto";
import { differenceInSeconds } from "date-fns";
import { ma } from "moving-averages";
import {
  getHistoricalBalanceData,
  getHistoricalData,
  getHorses,
} from "../../fs-utils";
import {
  calculateChances,
  convertFractionOddsToChance,
  convertFractionOddsToDecimal,
  determineWinner,
  generateLineUp,
  isValidDataSource,
  sortByOdds,
} from "../../utils";

const updateCharts = async (dataSource: unknown) => {
  if (!isValidDataSource(dataSource)) throw new Error("Invalid data source");

  const [historicalDataRes, historicalBalanceDataRes] = await Promise.all([
    fetch(`/api/historical-data?type=${dataSource}`),
    fetch(`/api/balance-log?type=${dataSource}`),
  ]);
  const [historicalData, historicalBalanceData] = await Promise.all([
    historicalDataRes.json(),
    historicalBalanceDataRes.json(),
  ]);

  movingAverageChart(chart0, historicalBalanceData);
  doIt(chart1, "horse", historicalData);
  doIt(chart2, "group", historicalData);
  doReturns(chart3, historicalData);
  doReturnsLine(chart4, historicalData);
  doReturnsLineSim(chart5);
};

const movingAverageChart = async (
  chart: Chart,
  historicalBalanceData: Awaited<ReturnType<typeof getHistoricalBalanceData>>
) => {
  const diffs: number[] = [];
  for (let i = 1; i < historicalBalanceData.length; i++) {
    const date1 = new Date(historicalBalanceData[i - 1].dateTime);
    const date2 = new Date(historicalBalanceData[i].dateTime);
    if (Math.abs(differenceInSeconds(date2, date1)) > 60) continue;
    const diff =
      historicalBalanceData[i].balance - historicalBalanceData[i - 1].balance;
    diffs.push(diff);
  }
  const movingAverages = ma(diffs, 250);

  chart.data = {
    labels: movingAverages.map((_, i) => i),
    datasets: [
      {
        label: "Moving Average",
        data: movingAverages,
        borderColor: "red",
        backgroundColor: "red",
      },
    ],
  };
  chart.options = {
    elements: {
      point: {
        radius: 0,
      },
    },
  };
  chart.update();
};

document.getElementById("data-source")?.addEventListener("change", (e) => {
  const value = (e.target as HTMLSelectElement).value;
  updateCharts(value);
});

const initChart = (id: number, type: "bar" | "line" = "bar") => {
  const ctx = document.getElementById(`chart${id}`) as HTMLCanvasElement;
  // @ts-ignore
  return new Chart(ctx, { type: type, options: { animation: false } });
};

const chart0 = initChart(0, "line");
const chart1 = initChart(1);
const chart2 = initChart(2);
const chart3 = initChart(3);
const chart4 = initChart(4, "line");
const chart5 = initChart(5, "line");

const doIt = async (
  chart: Chart,
  groupType: "horse" | "group",
  historicalData: Awaited<ReturnType<typeof getHistoricalData>>
) => {
  const data = {
    actualWins: {},
    expectedWinsByOdds: {},
    adjustedWinsProportionately: {},
    adjustedWinsToFirstHorse: {},
  };

  if (groupType === "group") {
    Object.keys(data).forEach((key) => {
      data[key] = {
        favourites: 0,
        outsiders: 0,
        underdogs: 0,
      };
    });
  }

  historicalData.forEach(({ lineUp, winner }) => {
    if (groupType === "horse") {
      const sorted = sortByOdds(lineUp);
      const winnerId = sorted.findIndex(
        (horse) => JSON.stringify(horse) === JSON.stringify(winner)
      );

      data.actualWins[winnerId] = (data.actualWins[winnerId] ?? 0) + 1;

      sorted.forEach((horse, i) => {
        if (!data.expectedWinsByOdds[i]) data.expectedWinsByOdds[i] = 0;

        data.expectedWinsByOdds[i] += convertFractionOddsToChance(
          horse.oddsNumerator,
          horse.oddsDenominator
        );
      });

      const proportionateChances = calculateChances(sorted, "proportionate");
      proportionateChances.forEach((chance, i) => {
        if (!data.adjustedWinsProportionately[i])
          data.adjustedWinsProportionately[i] = 0;

        data.adjustedWinsProportionately[i] += chance;
      });

      const firstHorseChances = calculateChances(sorted, "first-horse");
      firstHorseChances.forEach((chance, i) => {
        if (!data.adjustedWinsToFirstHorse[i])
          data.adjustedWinsToFirstHorse[i] = 0;

        data.adjustedWinsToFirstHorse[i] += chance;
      });
    } else {
      data.actualWins[winner.group] += 1;

      const proportionateChances = calculateChances(lineUp, "proportionate");
      const firstHorseChances = calculateChances(lineUp, "first-horse");

      lineUp.forEach((horse, i) => {
        data.expectedWinsByOdds[horse.group] += convertFractionOddsToChance(
          horse.oddsNumerator,
          horse.oddsDenominator
        );

        data.adjustedWinsProportionately[horse.group] +=
          proportionateChances[i];
        data.adjustedWinsToFirstHorse[horse.group] += firstHorseChances[i];
      });
    }
  });

  chart.data = {
    labels: Object.keys(data.actualWins).map((x) =>
      groupType === "group" ? x : Number(x) + 1
    ),
    datasets: [
      {
        label: "Actual Wins",
        data: Object.values(data.actualWins) as number[],
        borderColor: "blue",
        backgroundColor: "blue",
      },
      {
        label: "Adjusted Wins To First Horse",
        data: Object.values(data.adjustedWinsToFirstHorse) as number[],
        borderColor: "red",
        backgroundColor: "red",
      },
      {
        label: "Adjusted Wins Proportionately",
        data: Object.values(data.adjustedWinsProportionately) as number[],
        borderColor: "orange",
        backgroundColor: "orange",
      },
      {
        label: "Expected Wins By Odds",
        data: Object.values(data.expectedWinsByOdds) as number[],
        borderColor: "green",
        backgroundColor: "green",
      },
    ],
  };

  chart.update();
};

let horses: Awaited<ReturnType<typeof getHorses>> | undefined;

const doReturns = async (
  chart: Chart,
  historicalData: Awaited<ReturnType<typeof getHistoricalData>>
) => {
  if (!horses) {
    horses = (await fetch("/api/horses").then((res) => res.json())) as Awaited<
      ReturnType<typeof getHorses>
    >;
  }

  chart.options.scales = {
    y: {
      min: 0,
      max: 3,
    },
  };

  const data = {
    returns: {},
    playedGames: {},
    wonGames: {},
  };

  for (let i = 0; i < horses.length; i++) {
    data.returns[i] = 0;
    data.playedGames[i] = 0;
    data.wonGames[i] = 0;
  }

  const next = (index = 0) => {
    const { lineUp, winner } = historicalData[index];

    lineUp.forEach((horse, i) => {
      const id = horses.findIndex((x) => x.name === horse.name);

      if (!data.returns[id]) data.returns[id] = 0;
      if (!data.playedGames[id]) data.playedGames[id] = 0;
      if (!data.wonGames[id]) data.wonGames[id] = 0;

      data.playedGames[id] += 1;

      if (JSON.stringify(horse) === JSON.stringify(winner)) {
        data.wonGames[id] += 1;
      }

      data.returns[id] =
        (convertFractionOddsToDecimal(
          horse.oddsNumerator,
          horse.oddsDenominator
        ) *
          data.wonGames[id]) /
        data.playedGames[id];
    });

    chart.data = {
      labels: Object.keys(data.returns),
      datasets: [
        {
          label: "Returns",
          data: Object.values(data.returns) as number[],
          borderColor: "blue",
          backgroundColor: horses.map((horse) => {
            function getColor(value: number) {
              var hue = ((1 - value) * 120).toString(10);
              return ["hsl(", hue, ",100%,50%)"].join("");
            }
            return getColor(
              convertFractionOddsToChance(
                horse.oddsNumerator,
                horse.oddsDenominator
              ) * 2
            );
          }),
        },
      ],
    };

    chart.update();

    if (index < historicalData.length - 1) {
      setTimeout(() => next(index + 1), 1);
    }
  };

  next();
};

const doReturnsLine = async (
  chart: Chart,
  historicalData: Awaited<ReturnType<typeof getHistoricalData>>
) => {
  if (!horses) {
    horses = (await fetch("/api/horses").then((res) => res.json())) as Awaited<
      ReturnType<typeof getHorses>
    >;
  }

  setInterval(() => {
    chart.update("none");
  }, 1000);

  chart.options.scales = {
    y: {
      min: 0,
      max: 3,
    },
  };
  chart.options.elements = {
    point: {
      radius: 0,
    },
  };
  // @ts-ignore
  chart.options.spanGaps = true;

  chart.data = {
    labels: [],
    datasets: [],
  };

  const localData = {
    returns: [] as number[][],
    playedGames: {},
    wonGames: {},
  };

  function getColor(value: number) {
    const hue = ((1 - value) * 120).toString(10);
    const transparency = value.toString(10);

    return `hsla(${hue},100%,50%,${transparency})`;
  }

  for (let i = 0; i < horses.length; i++) {
    localData.playedGames[i] = 0;
    localData.wonGames[i] = 0;

    const color = getColor(
      convertFractionOddsToChance(
        horses[i].oddsNumerator,
        horses[i].oddsDenominator
      ) * 2
    );

    chart.data.datasets.push({
      label: `#${i}`,
      data: [] as number[],
      borderColor: color,
      backgroundColor: color,
    });
  }

  const next = (index = 0) => {
    chart.data.labels!.push(index);

    const { lineUp, winner } = historicalData[index];
    for (let i = 0; i < horses.length; i++) {
      localData.returns[index] = [];
      localData.returns[index][i] = 0;
    }

    lineUp.forEach((horse, i) => {
      const id = horses.findIndex((x) => x.name === horse.name);

      if (!localData.returns[id]) localData.returns[index][id] = 0;
      if (!localData.playedGames[id]) localData.playedGames[id] = 0;
      if (!localData.wonGames[id]) localData.wonGames[id] = 0;

      localData.playedGames[id] += 1;

      if (JSON.stringify(horse) === JSON.stringify(winner)) {
        localData.wonGames[id] += 1;
      }

      localData.returns[index][id] =
        (convertFractionOddsToDecimal(
          horse.oddsNumerator,
          horse.oddsDenominator
        ) *
          localData.wonGames[id]) /
        localData.playedGames[id];
    });

    for (let i = 0; i < horses.length; i++) {
      // @ts-ignore
      chart.data.datasets[i].data[index] =
        // localData.returns[index][i] || chart.data.datasets[i].data[index - 1];
        localData.returns[index][i] || undefined;
    }

    if (index < historicalData.length - 1) {
      // setTimeout(() => next(index + 1), 1);
      requestAnimationFrame(() => next(index + 1));
      // next(index + 1);
    }
  };

  next();
};

const doReturnsLineSim = async (chart: Chart) => {
  if (!horses) {
    horses = (await fetch("/api/horses").then((res) => res.json())) as Awaited<
      ReturnType<typeof getHorses>
    >;
  }

  setInterval(() => {
    chart.update("none");
  }, 1000);

  chart.options.scales = {
    y: {
      min: 0,
      max: 3,
    },
  };
  chart.options.elements = {
    point: {
      radius: 0,
    },
  };
  // @ts-ignore
  chart.options.spanGaps = true;

  chart.data = {
    labels: [],
    datasets: [],
  };

  const localData = {
    returns: [] as number[][],
    playedGames: {},
    wonGames: {},
  };

  function getColor(value: number) {
    const hue = ((1 - value) * 120).toString(10);
    const transparency = value.toString(10);

    return `hsla(${hue},100%,50%,${transparency})`;
  }

  for (let i = 0; i < horses.length; i++) {
    localData.playedGames[i] = 0;
    localData.wonGames[i] = 0;

    const color = getColor(
      convertFractionOddsToChance(
        horses[i].oddsNumerator,
        horses[i].oddsDenominator
      ) * 2
    );

    chart.data.datasets.push({
      label: `#${i}`,
      data: [] as number[],
      borderColor: color,
      backgroundColor: color,
    });
  }

  const next = () => {
    const iterate = () => {
      const index = chart.data.labels.length;

      chart.data.labels!.push(index);

      // const { lineUp, winner } = historicalData[index];
      const lineUp = generateLineUp(horses);
      const winner = determineWinner(lineUp);

      for (let i = 0; i < horses.length; i++) {
        localData.returns[index] = [];
        localData.returns[index][i] = 0;
      }

      lineUp.forEach((horse, i) => {
        const id = horses.findIndex((x) => x.name === horse.name);

        if (!localData.returns[id]) localData.returns[index][id] = 0;
        if (!localData.playedGames[id]) localData.playedGames[id] = 0;
        if (!localData.wonGames[id]) localData.wonGames[id] = 0;

        localData.playedGames[id] += 1;

        if (JSON.stringify(horse) === JSON.stringify(winner)) {
          localData.wonGames[id] += 1;
        }

        localData.returns[index][id] =
          (convertFractionOddsToDecimal(
            horse.oddsNumerator,
            horse.oddsDenominator
          ) *
            localData.wonGames[id]) /
          localData.playedGames[id];
      });

      for (let i = 0; i < horses.length; i++) {
        // @ts-ignore
        chart.data.datasets[i].data[index] =
          // localData.returns[index][i] || chart.data.datasets[i].data[index - 1];
          localData.returns[index][i] || undefined;
      }
    };

    for (let i = 0; i < 50; i++) {
      iterate();
    }

    // if (index < historicalData.length - 1) {
    setTimeout(next, 1000);
    // requestAnimationFrame(() => next());
    // next(index + 1);
    // }
  };

  next();
};

updateCharts(
  (document.getElementById("data-source") as HTMLSelectElement).value
);
