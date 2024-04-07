import Chart, { ChartData } from "chart.js/auto";
import annotationPlugin from "chartjs-plugin-annotation";
import jStat from "jstat";

Chart.register(annotationPlugin);

const data1: ChartData = {
  labels: [] as number[],
  datasets: [
    {
      label: "Red",
      data: [] as number[],
      borderColor: "red",
      backgroundColor: "red",
    },
    {
      label: "Black",
      data: [] as number[],
      borderColor: "black",
      backgroundColor: "black",
    },
    {
      label: "Expected Red",
      data: [] as number[],
      borderColor: "blue",
      backgroundColor: "blue",
    },
  ],
};

const data2: ChartData = {
  labels: [] as number[],
  datasets: [
    {
      label: "Chi Square",
      data: [] as number[],
      borderColor: "red",
      backgroundColor: "red",
    },
  ],
};
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

const data4: ChartData = {
  labels: [] as number[],
  datasets: [
    {
      label: "Cohen W",
      data: [] as number[],
      borderColor: "green",
      backgroundColor: "green",
    },
  ],
};

const ctx1 = document.getElementById("chart1") as HTMLCanvasElement;
const ctx2 = document.getElementById("chart2") as HTMLCanvasElement;
const ctx3 = document.getElementById("chart3") as HTMLCanvasElement;
const ctx4 = document.getElementById("chart4") as HTMLCanvasElement;

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

const chart4 = new Chart(ctx4, {
  type: "line",
  data: data4,
  options: {
    animation: false,
    elements: {
      point: {
        radius: 0,
      },
    },
  },
});

let iterations = 10000;

let games = 0;
let redWins = 0;
let blackWins = 0;
let expectedRed = 0;

const iterate = () => {
  const batchSize = 1000000;
  for (let i = 0; i < batchSize; i++) {
    const color = Math.random() > 0.5 ? "Red" : "Black";
    games++;
    if (color === "Red") {
      redWins++;
    } else {
      blackWins++;
    }
    expectedRed += 0.5;
  }

  data1.datasets[0].data.push(redWins / games);
  data1.datasets[1].data.push(blackWins / games);
  data1.datasets[2].data.push(expectedRed / games);

  data1.labels?.push(games);
  data2.labels?.push(games);
  data3.labels?.push(games);
  data4.labels?.push(games);

  const chiSquare = Math.pow(redWins - expectedRed, 2) / expectedRed;
  data2.datasets[0].data.push(chiSquare);

  const significanceLevel = chiSquareRightTailArea(chiSquare, 1);
  data3.datasets[0].data.push(significanceLevel);

  const cohenW = Math.sqrt(chiSquare / games);
  data4.datasets[0].data.push(cohenW);

  chart1.update("none");
  chart2.update("none");
  chart3.update("none");
  chart4.update("none");

  iterations--;
  if (iterations >= 0 && !paused) {
    requestAnimationFrame(iterate);
  }
};
iterate();
