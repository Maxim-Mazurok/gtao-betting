import Chart, { ChartData } from "chart.js/auto";
import annotationPlugin from "chartjs-plugin-annotation";
import jStat from "jstat";
import { calculateChances, determineWinner, generateLineUp } from "../../utils";
import { getHorses } from "../../fs-utils";

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

let paused = localStorage.getItem("paused") === "true";
if (paused) {
  document.getElementById("pause")?.setAttribute("checked", "checked");
}
document.getElementById("pause")?.addEventListener("change", (e) => {
  paused = (e.target as HTMLInputElement).checked;
  localStorage.setItem("paused", paused.toString());
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
    plugins: {
      legend: {
        onClick(e, legendItem, legend) {
          const index = legendItem.datasetIndex;
          const ci = legend.chart;
          if (legendItem.text === "Toggle All") {
            const visibility = !ci.getDatasetMeta(0).hidden; // Toggle based on the first dataset's visibility
            ci.data.datasets.forEach((dataset, i) => {
              ci.setDatasetVisibility(i, !visibility);
            });
          } else {
            // Default toggle behavior
            index &&
              ci.setDatasetVisibility(index, !ci.isDatasetVisible(index));
          }
          ci.update();
        },
        labels: {
          generateLabels(chart) {
            // Generate default labels
            const labels =
              Chart.defaults.plugins.legend.labels.generateLabels(chart);
            // Add custom "Toggle All" label
            labels.unshift({
              text: "Toggle All",
              datasetIndex: -1, // Custom index for identification
            });
            return labels;
          },
        },
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
      legend: {
        onClick(e, legendItem, legend) {
          const index = legendItem.datasetIndex;
          const ci = legend.chart;
          if (legendItem.text === "Toggle All") {
            const visibility = !ci.getDatasetMeta(0).hidden; // Toggle based on the first dataset's visibility
            ci.data.datasets.forEach((dataset, i) => {
              ci.setDatasetVisibility(i, !visibility);
            });
          } else {
            // Default toggle behavior
            index &&
              ci.setDatasetVisibility(index, !ci.isDatasetVisible(index));
          }
          ci.update();
        },
        labels: {
          generateLabels(chart) {
            // Generate default labels
            const labels =
              Chart.defaults.plugins.legend.labels.generateLabels(chart);
            // Add custom "Toggle All" label
            labels.unshift({
              text: "Toggle All",
              datasetIndex: -1, // Custom index for identification
            });
            return labels;
          },
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
let gamesPerHorse = Array.from({ length: 30 }, () => 0);
let wins = Array.from({ length: 30 }, () => 0);
let expectedWins = Array.from({ length: 30 }, () => 0);

const iterate = () => {
  const batchSize = 100000;
  for (let i = 0; i < batchSize; i++) {
    const lineUp = generateLineUp(window["horses"]);
    const chances = calculateChances(lineUp, "proportionate");
    lineUp.forEach((horse, i) => {
      const id = horse.oddsNumerator - 1;
      expectedWins[id] += chances[i];
      gamesPerHorse[id]++;
    });
    let winner = determineWinner(lineUp);
    if (Math.random() <= 1 / 500) {
      // "house wins" 1 in 1000 games
      winner = lineUp.sort((a, b) => a.oddsNumerator - b.oddsNumerator)[0];
    }

    const winnerId = winner.oddsNumerator - 1;

    games++;
    wins[winnerId]++;
  }

  for (let i = 0; i < 30; i++) {
    data1.datasets[i].data.push(wins[i] / gamesPerHorse[i]);
  }

  data1.labels?.push(games);
  data2.labels?.push(games);
  data3.labels?.push(games);

  let totalChiSquare = 0;
  for (let i = 0; i < 30; i++) {
    const chiSquare = Math.pow(wins[i] - expectedWins[i], 2) / expectedWins[i];
    chart2.data.datasets[i + 1].data.push(chiSquare);
    if (isNaN(chiSquare)) continue;
    totalChiSquare += chiSquare;
  }
  data2.datasets[0].data.push(totalChiSquare);

  const significanceLevel = chiSquareRightTailArea(totalChiSquare, 28);
  data3.datasets[0].data.push(significanceLevel);

  chart1.update("none");
  chart2.update("none");
  chart3.update("none");
  iterations--;
  if (iterations >= 0 && !paused) {
    requestAnimationFrame(iterate);
  }
};

(async () => {
  window["horses"] = (await (await fetch("/api/horses")).json()) as Awaited<
    ReturnType<typeof getHorses>
  >;
  iterate();
})();
