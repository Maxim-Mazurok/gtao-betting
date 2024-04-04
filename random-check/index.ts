import Chart, { ChartData } from "chart.js/auto";
import annotationPlugin from "chartjs-plugin-annotation";
import jStat from "jstat";
import { rando } from "@nastyox/rando.js";

Chart.register(annotationPlugin);

const colors = [
  "#000000",
  "#6A5ACD",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#00FFFF",
  "#FF00FF",
  "#C0C0C0",
  "#808080",
  "#800000",
  "#808000",
  "#008000",
  "#800080",
  "#008080",
  "#000080",
  "#FFA500",
  "#FFD700",
  "#FFC0CB",
  "#A52A2A",
  "#FF7F50",
  "#8A2BE2",
  "#F5DEB3",
  "#32CD32",
  "#87CEEB",
  "#D2691E",
  "#FF6347",
  "#40E0D0",
  "#FF8C00",
  "#DDA0DD",
];

const data1: ChartData = {
  labels: [] as number[],
  datasets: [],
};

const data2: ChartData = {
  labels: [] as number[],
  datasets: [
    {
      label: "Total Chi Square",
      data: [] as number[],
      borderColor: "red",
      backgroundColor: "red",
      weight: 3,
    },
  ],
};

for (let i = 0; i <= 29; i++) {
  data1.datasets.push({
    label: `#${i}`,
    data: [] as number[],
    borderColor: colors[i],
    backgroundColor: colors[i],
  });
  data2.datasets.push({
    label: `#${i}`,
    data: [] as number[],
    borderColor: colors[i],
    backgroundColor: colors[i],
  });
}

const data3: ChartData = {
  labels: [] as number[],
  datasets: [
    {
      label: "Significance Level",
      data: [] as number[],
      borderColor: "blue",
      backgroundColor: "blue",
    },
  ],
};

const ctx1 = document.getElementById("chart1") as HTMLCanvasElement;
const ctx2 = document.getElementById("chart2") as HTMLCanvasElement;
const ctx3 = document.getElementById("chart3") as HTMLCanvasElement;

let paused = false;
document.getElementById("pause")?.addEventListener("change", (e) => {
  paused = (e.target as HTMLInputElement).checked;
  if (!paused) {
    iterate();
  }
});

const chart1 = new Chart(ctx1, {
  type: "line",
  data: data1,
  options: {
    animation: false,
    elements: {
      point: {
        radius: 0,
      },
    },
  },
});

function chiSquareRightTailArea(criticalValue, degreesOfFreedom) {
  // The area to the right is 1 minus the cumulative distribution function up to the critical value
  return 1 - jStat.chisquare.cdf(criticalValue, degreesOfFreedom);
}

function average(ctx) {
  const values = ctx.chart.data.datasets[0].data;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
const annotation = {
  type: "line" as const,
  borderColor: "black",
  borderDash: [6, 6],
  borderDashOffset: 0,
  borderWidth: 3,
  label: {
    display: true,
    content: (ctx) => "Average: " + average(ctx).toFixed(2),
    position: "end" as const,
  },
  scaleID: "y",
  value: (ctx) => average(ctx),
};
const chart2 = new Chart(ctx2, {
  type: "line",
  data: data2,
  options: {
    animation: false,
    elements: {
      point: {
        radius: 0,
      },
    },
    plugins: {
      annotation: {
        annotations: {
          annotation,
        },
      },
    },
  },
});
const chart3 = new Chart(ctx3, {
  type: "line",
  data: data3,
  options: {
    animation: false,
    elements: {
      point: {
        radius: 0,
      },
    },
    plugins: {
      annotation: {
        annotations: {
          annotation,
        },
      },
    },
  },
});

let iterations = 10000;

let games = 0;
let wins = Array.from({ length: 30 }, () => 0);
let expectedWins = Array.from({ length: 30 }, () => 0);

const totalChances = (() => {
  let total = 0;
  for (let i = 1; i <= 30; i++) {
    total += 1 / (i + 1);
  }
  return total;
})();

const getWinnerId = () => {
  const houseWins = rando(0, 500) === 0;
  if (houseWins) {
    return 29;
  }

  const _random = rando(0, totalChances, "float");
  let random = _random;
  for (let i = 1; i <= 30; i++) {
    random -= 1 / (i + 1);
    if (random < 0) {
      // console.log({ _random, totalChances, i });
      return i;
    }
  }
  // console.log({random, totalChances, 29})
  return 29;
};

const iterate = () => {
  const batchSize = 100;
  for (let i = 0; i < batchSize; i++) {
    // const color = Math.random() > 0.4 ? "Red" : "Black";
    const horseId = getWinnerId();

    games++;
    wins[horseId - 1]++;

    for (let i = 1; i <= 30; i++) {
      const chance = 1 / (i + 1);
      const adjustedChance = chance / totalChances;
      expectedWins[i - 1] += adjustedChance;
    }
  }

  for (let i = 0; i < 30; i++) {
    data1.datasets[i].data.push(wins[i] / games);
  }

  data1.labels?.push(games);
  data2.labels?.push(games);
  data3.labels?.push(games);

  let totalChiSquare = 0;
  for (let i = 0; i < 30; i++) {
    const chiSquare = Math.pow(wins[i] - expectedWins[i], 2) / expectedWins[i];
    chart2.data.datasets[i + 1].data.push(chiSquare);
    totalChiSquare += chiSquare;
  }
  data2.datasets[0].data.push(totalChiSquare);

  const significanceLevel = chiSquareRightTailArea(totalChiSquare, 29);
  data3.datasets[0].data.push(significanceLevel);

  chart1.update("none");
  chart2.update("none");
  chart3.update("none");
  iterations--;
  if (iterations >= 0 && !paused) {
    requestAnimationFrame(iterate);
  }
};
iterate();
