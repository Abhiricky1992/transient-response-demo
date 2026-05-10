Reveal.initialize({
  hash: true,
  slideNumber: true,
  transition: "fade"
});

Reveal.on("fragmentshown", event => {
  if (event.fragment.classList.contains("gust-fragment")) {
    document.getElementById("aircraftBody").classList.add("oscillate");
  }
});

Reveal.on("fragmenthidden", event => {
  if (event.fragment.classList.contains("gust-fragment")) {
    document.getElementById("aircraftBody").classList.remove("oscillate");
  }
});

function animateGustStep() {
  const line = document.getElementById("gustStepLine");
  if (!line) return;

  const points = [
    [55, 165],
    [150, 165],
    [150, 75],
    [345, 75]
  ];

  let segment = 0;
  let progress = 0;
  const speed = 0.035;

  function interpolate(p1, p2, s) {
    return [
      p1[0] + (p2[0] - p1[0]) * s,
      p1[1] + (p2[1] - p1[1]) * s
    ];
  }

  function draw() {
    if (segment >= points.length - 1) return;

    progress += speed;

    const drawnPoints = points.slice(0, segment + 1);
    const current = interpolate(points[segment], points[segment + 1], progress);

    drawnPoints.push(current);

    line.setAttribute(
      "points",
      drawnPoints.map(p => `${p[0]},${p[1]}`).join(" ")
    );

    if (progress >= 1) {
      segment++;
      progress = 0;
    }

    requestAnimationFrame(draw);
  }

  line.setAttribute("points", "");
  requestAnimationFrame(draw);
}

Reveal.on("fragmentshown", event => {
  if (event.fragment.classList.contains("gust-fragment")) {
    document.getElementById("aircraftBody").classList.add("oscillate");
    animateGustStep();
  }
});

let firstOrderAnimationId = null;

function updateFirstOrderPlot(tau, animate = false) {
  const curve = document.getElementById("firstOrderCurve");
  const tauVertical = document.getElementById("tauVertical");
  const tauHorizontal = document.getElementById("tauHorizontal");
  const tauMarker = document.getElementById("tauMarkerLabel");
  const tauValue = document.getElementById("tauValue");

  if (!curve || !tauVertical || !tauHorizontal) return;

  const x0 = 70;
  const y0 = 245;
  const width = 400;
  const height = 165;
  const tMax = 5.0;
  const n = 180;

  if (tauValue) {
    tauValue.textContent = tau.toFixed(1);
  }

  const xTau = x0 + (tau / tMax) * width;
  const yTau = y0 - 0.632 * height;

  tauVertical.setAttribute("x1", xTau);
  tauVertical.setAttribute("x2", xTau);
  tauVertical.setAttribute("y1", y0);
  tauVertical.setAttribute("y2", yTau);

  tauHorizontal.setAttribute("x1", x0);
  tauHorizontal.setAttribute("x2", xTau);
  tauHorizontal.setAttribute("y1", yTau);
  tauHorizontal.setAttribute("y2", yTau);

 if (tauMarker) {
  const svg = document.querySelector(".fo-plot");
  const card = document.querySelector(".fo-plot-card");

  const svgRect = svg.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();

  const viewBox = svg.viewBox.baseVal;

  const xPixel =
    svgRect.left -
    cardRect.left +
    ((xTau - viewBox.x) / viewBox.width) * svgRect.width;

  const yPixel =
    svgRect.top -
    cardRect.top +
    ((y0 - viewBox.y) / viewBox.height) * svgRect.height;

  tauMarker.style.left = `${xPixel+15}px`;
  tauMarker.style.top = `${yPixel + 20}px`;
}

  function makePoint(i) {
    const t = (tMax * i) / n;
    const yNorm = 1 - Math.exp(-t / tau);

    const x = x0 + (t / tMax) * width;
    const y = y0 - yNorm * height;

    return `${x},${y}`;
  }

  if (!animate) {
    const points = [];
    for (let i = 0; i <= n; i++) {
      points.push(makePoint(i));
    }
    curve.setAttribute("points", points.join(" "));
    return;
  }

  if (firstOrderAnimationId) {
    cancelAnimationFrame(firstOrderAnimationId);
  }

  curve.setAttribute("points", "");

  let i = 0;
  const points = [];

  function draw() {
    points.push(makePoint(i));
    curve.setAttribute("points", points.join(" "));

    i++;

    if (i <= n) {
      firstOrderAnimationId = requestAnimationFrame(draw);
    }
  }

  draw();
}

function initializeFirstOrderSlider() {
  const slider = document.getElementById("tauSlider");
  if (!slider) return;

  updateFirstOrderPlot(parseFloat(slider.value), true);

  slider.oninput = function () {
    updateFirstOrderPlot(parseFloat(this.value), false);
  };

  if (window.MathJax) {
    MathJax.typesetPromise();
  }
}

Reveal.on("fragmentshown", event => {
  if (event.fragment.classList.contains("fo-plot-card")) {
    initializeFirstOrderSlider();
  }
});

Reveal.on("slidechanged", event => {
  if (
    event.currentSlide &&
    event.currentSlide.classList.contains("fo-slide")
  ) {
    setTimeout(initializeFirstOrderSlider, 200);
  }
});

let metricsAnimationId = null;

function animateMetricsCurve() {
  const curve = document.getElementById("metricsCurve");
  if (!curve) return;

  if (metricsAnimationId) {
    cancelAnimationFrame(metricsAnimationId);
  }

  const x0 = 75;
  const y0 = 340;
  const width = 485;
  const height = 245;
  const tMax = 5.0;
  const tau = 1.0;
  const n = 180;

  let points = [];
  let i = 0;

  curve.setAttribute("points", "");

  function draw() {
    const t = (tMax * i) / n;
    const yNorm = 1 - Math.exp(-t / tau);

    const x = x0 + (t / tMax) * width;
    const y = y0 - yNorm * height;

    points.push(`${x},${y}`);
    curve.setAttribute("points", points.join(" "));

    i++;

    if (i <= n) {
      metricsAnimationId = requestAnimationFrame(draw);
    }
  }

  draw();
}

Reveal.on("fragmentshown", event => {
  if (event.fragment.classList.contains("plot-card")) {
    animateMetricsCurve();
  }
});

Reveal.on("slidechanged", event => {
  if (event.currentSlide && event.currentSlide.classList.contains("metrics-slide")) {
    setTimeout(animateMetricsCurve, 200);
  }
});


