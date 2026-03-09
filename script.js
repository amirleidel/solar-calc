document.getElementById("to-anlage").addEventListener("click", function () {

  const tabTrigger = document.querySelector('a[href="#tab-top-2"]');
  const tab = new bootstrap.Tab(tabTrigger);

  tab.show();
  document.getElementById("selection-card").scrollIntoView({block: "center"});
  document.getElementById("steps-open-1").classList.remove("active");
  document.getElementById("steps-open-2").classList.add("active");

});

document.getElementById("to-pumpe").addEventListener("click", function () {
    
    if (model.heat_pump == 1) { // when there is a heat pump
    const tabTrigger = document.querySelector('a[href="#tab-top-3"]');
    const tab = new bootstrap.Tab(tabTrigger);

    tab.show();
    document.getElementById("selection-card").scrollIntoView({block: "center"});
    document.getElementById("steps-open-2").classList.remove("active");
    document.getElementById("steps-open-3").classList.add("active");
        
    }
    else { // default, when there is no heat pump, go straight to results
        document.getElementById("results-card").scrollIntoView({block: "center"});
        document.getElementById("steps-open-2").classList.remove("active");
        document.getElementById("steps-finish").classList.add("active");
        // finish calculations here
        finish(model,prices,investments);
    }

});

document.getElementById("to-results").addEventListener("click", function () {

  document.getElementById("results-card").scrollIntoView({block: "center"});
  document.getElementById("steps-open-3").classList.remove("active");
  document.getElementById("steps-finish").classList.add("active");
  // finish calculations here
  finish(model,prices,investments);
});

const batteryStorageCostInput = document.getElementById("battery-storage-cost-input");

batteryStorageCostInput.addEventListener("change", function () {
    investments.storage = parseInt(this.value);
});
document.getElementById("heat-pump-cost-input").addEventListener("change", function () {
    investments.heat_pump = parseInt(this.value);
});
document.getElementById("solar-array-cost-input").addEventListener("change", function () {
    investments.solar = parseInt(this.value);
});


document.getElementById("battery-storage-switch").addEventListener("change", function () {
    if (this.checked) {
        model.battery_storage = 1;
        batteryStorageCostInput.removeAttribute("disabled");
        batteryStorageCostInput.value = "8000";
        batteryStorageCostInput.removeAttribute("readonly");
        investments.storage = parseInt(batteryStorageCostInput.value);
        
    } else {
        model.battery_storage = 0;
        batteryStorageCostInput.disabled = true;
        batteryStorageCostInput.value = "0";
        batteryStorageCostInput.readonly = true;
        investments.storage = parseInt(batteryStorageCostInput.value);
    }
});

const heatPumpCostInput = document.getElementById("heat-pump-cost-input");
const heatPumpSwitch = document.getElementById("heat-pump-switch");
const heatPumpTab = document.getElementById("heat-pump-tab");

heatPumpSwitch.addEventListener("change", function () {
    if (this.checked) {
        model.heat_pump = 1;
        document.getElementById("to-pumpe-text").innerText = "Weiter";
        heatPumpTab.classList.remove("disabled");
        heatPumpTab.removeAttribute("tabindex");
        heatPumpTab.removeAttribute("aria-disabled");
        
        heatPumpCostInput.removeAttribute("disabled");
        heatPumpCostInput.value = "15000";
        heatPumpCostInput.removeAttribute("readonly");
        investments.heat_pump = parseInt(heatPumpCostInput.value);
        
    } else {
        model.heat_pump = 0;
        document.getElementById("to-pumpe-text").innerText = "Fertig";
        heatPumpTab.classList.add("disabled");
        heatPumpTab.setAttribute("tabindex", "-1");
        heatPumpTab.setAttribute("aria-disabled", "true");
        
        heatPumpCostInput.disabled = true;
        heatPumpCostInput.value = "0";
        heatPumpCostInput.readonly = true;
        investments.heat_pump = parseInt(heatPumpCostInput.value);
    }
});


// model storing all the vars
const model = {
  persons: 1,
  consumption: 2000,
  state: 'Baden-Württemberg',
  latitude: 48.78,
  sun_hours: 1859,
  peak_power: 10,
  solar_type : "poly",
  heading: 180,
  tilt : 33,
  home_area : 100,
  home_type : "cat-1",
  heating_efficiency : 2.5,
  battery_storage : 0,
  heat_pump : 1,
  feedInType : 1,
  annualEnergy : 11154
};

const usageByPeople = {
  1: 2000,
  2: 3100,
  3: 4200,
  4: 4700,
  5: 5200,
  6: 5400,
  7: 5600,
  8: 5800,
  9: 6000
};

function estimateConsumption(persons) {

  estimatedUsage  = usageByPeople[persons] ?? usageByPeople[9];
  model.consumption = estimatedUsage;
    
  // display in input field
  const inputField = document.getElementById("consumption-input");
  inputField.value = estimatedUsage;
  
  return estimatedUsage;

}

// default is one person
estimateConsumption(1);

// all radio buttons
const radios = document.querySelectorAll('input[name="btn-radio-dropdown"]');
const dropdownRadio = document.getElementById("btn-radio-dropdown-dropdown");

radios.forEach(radio => {

  radio.addEventListener("change", function () {
    
    // 1. read dropdown value
    const inhabitants = parseInt(this.value);
    
    // 2. print value
    model.persons = inhabitants;
    estimateConsumption(inhabitants);

  });

});

// dropdown items
const dropdownItems = document.querySelectorAll(".dropdown-item");

dropdownItems.forEach(item => {

  item.addEventListener("click", function () {

    // 1. deselect all radio buttons
    radios.forEach(radio => {
      if (radio.id !== "btn-radio-dropdown-dropdown") {
        radio.checked = false;
      }
    });

    // select the dropdown radio
    dropdownRadio.checked = true;

    // 2. read dropdown value
    const inhabitants = parseInt(this.getAttribute("value"));
    model.persons = inhabitants;
    
    // 3. print value
    estimateConsumption(inhabitants);
    
  });

});

// solar interpolation constants
const maxSunHours = 1900;
const maxSunHeight = 48.14;

const minSunHours = 1500;
const minSunHeight = 54.32;

// latitude lookup using your select values (German order)
const stateLatitudes = {
  1: 48.78, // Baden-Württemberg
  2: 48.14, // Bayern
  3: 52.52, // Berlin
  4: 52.39, // Brandenburg
  5: 53.08, // Bremen
  6: 53.55, // Hamburg
  7: 50.08, // Hessen
  8: 53.63, // Mecklenburg-Vorpommern
  9: 52.37, // Niedersachsen
  10: 51.23, // Nordrhein-Westfalen
  11: 50.00, // Rheinland-Pfalz
  12: 49.24, // Saarland
  13: 51.05, // Sachsen
  14: 52.13, // Sachsen-Anhalt
  15: 54.32, // Schleswig-Holstein
  16: 50.98  // Thüringen
};

// optional state names for the model
const stateNames = {
  1: "Baden-Württemberg",
  2: "Bayern",
  3: "Berlin",
  4: "Brandenburg",
  5: "Bremen",
  6: "Hamburg",
  7: "Hessen",
  8: "Mecklenburg-Vorpommern",
  9: "Niedersachsen",
  10: "Nordrhein-Westfalen",
  11: "Rheinland-Pfalz",
  12: "Saarland",
  13: "Sachsen",
  14: "Sachsen-Anhalt",
  15: "Schleswig-Holstein",
  16: "Thüringen"
};

// interpolation function
function interpolateHours(height) {

  const m = (maxSunHours - minSunHours) / (maxSunHeight - minSunHeight);
  const t = minSunHours - m * minSunHeight;

  return Math.round(m * height + t);

}

// listen to dropdown changes
document.getElementById("state-select").addEventListener("change", function () {

  const stateValue = parseInt(this.value);

  const latitude = stateLatitudes[stateValue];

  const sunHours = interpolateHours(latitude);

  // update model
  model.state = stateNames[stateValue];
  model.latitude = latitude;
  model.sun_hours = sunHours;

  updateAnnualEnergyDisplay(model);

});

// document.getElementById(peak-power-select).value


document.getElementById("peak-power-select").addEventListener("input", function () {

    const peakPower = parseInt(this.value);
    
    document.getElementById("peak-power-display").innerText = peakPower;
    
});

document.getElementById("peak-power-select").addEventListener("change", function () {

    const peakPower = parseInt(this.value);
    
    model.peak_power = peakPower;
    
    updateAnnualEnergyDisplay(model);
    
    console.log(model.peak_power);
    
});

// get if solar is poly or mono
  
const solarTypeRadios = document.querySelectorAll('input[name="solar-type"]');

solarTypeRadios.forEach(radio => {
  radio.addEventListener("change", function () {
    if (this.checked) {
      model.solarType = this.value; // "mono" or "poly"
      console.log("Solar type selected:", model.solarType);
      console.log("Solar type selected:", model);
      // TODO : add poly-mono distinction
      //
      //
      updateAnnualEnergyDisplay(model);
    }
  });
});

// get if solar feed in type
  
const feedInRadios = document.querySelectorAll('input[name="feed-in-type"]');

feedInRadios.forEach(radio => {
  radio.addEventListener("change", function () {
    if (this.checked) {
      model.feedInType = this.value; // "1" or "0"
      
      console.log(model.feedInType);
      updateAnnualEnergyDisplay(model);
    }
  });
});

function interpolate(x, x0, y0, x1, y1) {
  const m = (y1 - y0) / (x1 - x0);
  const t = y0 - m * x0;
  return m * x + t;
}

function interpolateFacingEffectivity(degrees) {
  if (0 <= degrees && degrees < 90) {
    return interpolate(degrees, 0, 0.6, 90, 0.9);
  } else if (90 <= degrees && degrees < 180) {
    return interpolate(degrees, 90, 0.9, 180, 1.0);
  } else if (180 <= degrees && degrees < 270) {
    return interpolate(degrees, 180, 1.0, 270, 0.9);
  } else if (270 <= degrees && degrees <= 360) {
    return interpolate(degrees, 270, 0.9, 360, 0.6);
  } else {
    // optional: clamp out-of-range values
    console.warn("Degrees out of range 0-360:", degrees);
    return 0.6; // default minimum
  }
}

function tiltEffectivity(degreesTilt, optimumTilt = 33) {
  // convert to radians and take cosine
  const radians = (degreesTilt - optimumTilt) * Math.PI / 180;
  return Math.cos(radians);
}

function calculateAnnualEnergy(model) {
  // facing
  const facingEff = interpolateFacingEffectivity(model.heading); // 0.6-1.0
  // tilt
  const tiltEff = tiltEffectivity(model.tilt); // 0-1
  // combined effectivity
  const effectivity = 0.6 * facingEff * tiltEff; // factor 0.6 as per Python comment

  // energy in kWh
  const energy = model.sun_hours * model.peak_power * effectivity;

  return energy;
}

// update input field
function updateAnnualEnergyDisplay(model) {
  const energy = calculateAnnualEnergy(model);
  const inputField = document.getElementById("annual-energy-display");

  // format nicely, optional thousand separator
  inputField.value = Math.round(energy); //.toLocaleString("de-DE");
  
  model.annualEnergy = Math.round(energy);
}

document.getElementById("heading-select").addEventListener("input", function () {

    const headingValue = parseInt(this.value);
    
    document.getElementById("heading-display").innerText = headingValue;
    
});

document.getElementById("heading-select").addEventListener("change", function () {

    const headingValue = parseInt(this.value);
    
    model.heading = headingValue;
    
    updateAnnualEnergyDisplay(model);
    
});

document.getElementById("tilt-select").addEventListener("input", function () {

    const tiltValue = parseInt(this.value);
    
    document.getElementById("tilt-display").innerText = tiltValue;
    
});

document.getElementById("tilt-select").addEventListener("change", function () {

    const tiltValue = parseInt(this.value);
    
    model.tilt = tiltValue;
    
    updateAnnualEnergyDisplay(model);
    
});


document.getElementById("area-select").addEventListener("input", function () {

    const areaValue = parseInt(this.value);
    
    document.getElementById("area-display").innerText = areaValue;
    updateHeatingEnergyDisplay(model);
});

document.getElementById("area-select").addEventListener("change", function () {

    const areaValue = parseInt(this.value);
    
    model.home_area = areaValue;
    updateHeatingEnergyDisplay(model);

});

// building heating type
  
const buildingTypeRadios = document.querySelectorAll('input[name="home-type"]');

buildingTypeRadios.forEach(radio => {
  radio.addEventListener("change", function () {
    if (this.checked) {
      model.home_type = this.value; // "cat-1" to ... "cat-4"
      
      updateHeatingEnergyDisplay(model);
    }
  });
});

document.getElementById("heating-efficiency-input").addEventListener("input", function () {

    const heatingEfficiencyValue = parseInt(this.value);
    
    model.heating_efficiency = heatingEfficiencyValue/100;
    updateHeatingEnergyDisplay(model);
    
});


// Energy per area table
const energyPerArea = {  // kWh/a/m²
  "cat-1": 25,
  "cat-2": 40,
  "cat-3": 70,
  "cat-4": 150
};

// calculate heating energy
function calculateHeatingEnergy(model) {
  const perArea = energyPerArea[model.home_type]; // kWh/m²/a
  if (perArea === undefined) {
    console.warn("Unknown home type:", model.home_type);
    return 0;
  }

  const area = model.home_area || 0;
  const efficiency = model.heating_efficiency || 1;

  const energy = (perArea * area) / efficiency;

  return energy;
}

// update input field
function updateHeatingEnergyDisplay(model) {
  const energy = calculateHeatingEnergy(model);
  results.heating_energy = energy;
  
  const perArea = energyPerArea[model.home_type];
  
  const inputField = document.getElementById("energy-use-display");
  const inputEfficiencyField = document.getElementById("energy-efficiency-display");

  // format nicely with thousand separator
  inputField.value = Math.round(energy); //.toLocaleString("de-DE");
  inputEfficiencyField.value = Math.round(perArea);
}

const results = {
  heating_energy: 0,
  total_use: 0,
  own_use: 0,
  sold: 0,
  energy_cost : 0,
  energy_earnings : 0,
  energy_total : 0,
  energy_total_without : 0,
  savings : 0,
  amortisation : 0
};

document.getElementById("energy-cost-input").addEventListener("input", function () {

    const energyCostValue = parseInt(this.value);
    
    prices.energy = energyCostValue/100;
    
});

document.getElementById("feed-in-tariff-input").addEventListener("input", function () {

    const feedInValue = parseInt(this.value);
    
    prices.feedIn = feedInValue/100;

});

// start here for final calculations // 

// electrical energy use percentagess
const usePercentage = {
  with_storage: 0.8,
  without_storage: 0.3,
  no_own_use: 0.0
};

function calculateTotalUse(model) {

  const heating_energy = calculateHeatingEnergy(model);
  const usage = model.consumption;
  
  results.total_use = heating_energy + usage;

}

function calculateEnergyFlow(model) {

  const total_use = results.total_use;

  let percentage;

  if (model.battery_storage == 1) {
    percentage = usePercentage.with_storage;
  } 
  else {
    percentage = usePercentage.without_storage;
  } 
  
  if (model.feedInType == 0) {
    percentage = usePercentage.no_own_use;
  }

  let own_use = model.annualEnergy * percentage;

  // limit own use to household demand
  console.log(own_use,total_use);
  if (own_use > total_use) {
    own_use = total_use;
  }

  const sold = model.annualEnergy - own_use;

  results.own_use = own_use;
  results.sold = sold;
}

const prices = { // euro/kWh
    energy : 0.30,
    feedIn : 0.09
}

const investments = {
    solar : 15000,
    heat_pump : 15000,
    storage : 0
}

function calculateCosts(model,prices,investments) {
  
  results.energy_cost = (results.total_use-results.own_use)*prices.energy;
  results.energy_earnings = results.sold*prices.feedIn;
  results.energy_total = results.energy_earnings - results.energy_cost // if positive earnings
  results.energy_total_without = -results.total_use*prices.energy;
  results.savings = results.energy_total - results.energy_total_without;
  results.amortisation = Math.round((investments.solar + investments.heat_pump + investments.storage)/results.savings);
  
}

let energyChart;

document.addEventListener("DOMContentLoaded", function () {

  if (window.ApexCharts) {

    energyChart = new ApexCharts(
      document.getElementById('chart-demo-pie'),
      {
        chart: {
          type: "donut",
          fontFamily: 'inherit',
          height: 240,
          sparkline: { enabled: true },
          animations: { enabled: true }
        },

        series: [44, 55, 5],

        labels: ["Eigenverbrauch", "Einspeisung", "Ankauf"],

        colors: [
          '#066fd1',
          '#2fb344',
          '#d63939'
        ],

        legend: {
          show: true,
          position: 'left',
          offsetY: 12,
          markers: {
            width: 10,
            height: 10,
            radius: 100
          },
          itemMargin: {
            horizontal: 8,
            vertical: 8
          }
        },

        grid: { strokeDashArray: 4 },

        tooltip: {
          theme: 'light',
          fillSeriesColor: true
        }
      }
    );

    energyChart.render();
  }
});

function updateEnergyChart() {

  energyChart.updateSeries([
    Math.round(results.own_use),
    Math.round(results.sold),
    Math.round(results.total_use-results.own_use)
  ]);

}

function animateDisplay(value,id) {

  const el = document.getElementById(id);

  const duration = 400; // ms
  const start = 0;
  const startTime = performance.now();

  el.classList.remove("show");

  function update(now) {

    const progress = Math.min((now - startTime) / duration, 1);

    const current = Math.floor(start + (value - start) * progress);

    el.textContent = current; //.toLocaleString("de-DE");

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.classList.add("show");
    }
  }

  requestAnimationFrame(update);
}

function finish(model,prices,investments) {
  calculateTotalUse(model);
  calculateEnergyFlow(model);
  calculateCosts(model,prices,investments);
  
  animateDisplay(Math.round(results.energy_cost),"energy-cost-display");
  animateDisplay(Math.round(results.savings),"savings-display");
  animateDisplay(Math.round(results.energy_earnings),"energy-earnings-display");
  animateDisplay(Math.round(results.amortisation),"amortisation-display");
  
  //document.getElementById("energy-cost-display").innerText = Math.round(results.energy_cost);
  //document.getElementById("savings-display").innerText = Math.round(results.savings);
  //document.getElementById("energy-earnings-display").innerText = Math.round(results.energy_earnings);
  //document.getElementById("amortisation-display").innerText = Math.round(results.amortisation);
  
  updateEnergyChart();
  updateFinanceChart();
}

let financeChart;

document.addEventListener("DOMContentLoaded", function () {

  if (!window.ApexCharts) return;

  financeChart = new ApexCharts(
    document.getElementById("chart-demo-line"),
    {
      chart: {
        height: 260,
        type: "line",
        fontFamily: "inherit",
        toolbar: { show: false }
      },

      series: [
        {
          name: "Kosten",
          type: "column",
          data: []
        },
        {
          name: "Einnahmen",
          type: "column",
          data: []
        },
        {
          name: "Kumulierte Bilanz",
          type: "line",
          data: []
        }
      ],

      stroke: {
        width: [0, 0, 3],
        curve: "straight"
      },

      plotOptions: {
        bar: {
          columnWidth: "50%"
        }
      },

      colors: [
        "#d63939", // costs red
        "#2fb344", // earnings green
        "#066fd1"  // balance blue
      ],

      xaxis: {
        categories: Array.from({ length: 25 }, (_, i) => "Jahr " + (i + 1))
      },

      yaxis: {
        labels: {
          formatter: (v) => Math.round(v) + " €"
        }
      },

      tooltip: {
        theme: "light"
      },

      legend: {
        position: "bottom"
      },

      grid: {
        strokeDashArray: 4
      }
    }
  );

  financeChart.render();

});

function calculateFinanceSeries(results, investments) {

  const years = 25;

  const costs = [];
  const earnings = [];
  const balance = [];

  let cumulative = 0;

  const initialInvestment =
    investments.solar +
    investments.heat_pump +
    investments.storage;

  for (let year = 0; year < years; year++) {

    let yearlyCost = results.energy_cost;

    if (year === 0) {
      yearlyCost += initialInvestment;
    }

    let yearlySavings = results.savings;

    costs.push(-yearlyCost);
    earnings.push(yearlySavings);

    cumulative += yearlySavings - yearlyCost;

    balance.push(cumulative);
  }

  return { costs, earnings, balance };
}

function updateFinanceChart() {

  const data = calculateFinanceSeries(results, investments);

  financeChart.updateSeries([
    {
      name: "Kosten",
      type: "column",
      data: data.costs
    },
    {
      name: "Ersparnis",
      type: "column",
      data: data.earnings
    },
    {
      name: "Kumulierte Bilanz",
      type: "line",
      data: data.balance
    }
  ]);

}