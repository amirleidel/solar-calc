document.getElementById("to-anlage").addEventListener("click", function () {

  const tabTrigger = document.querySelector('a[href="#tab-top-2"]');
  const tab = new bootstrap.Tab(tabTrigger);

  tab.show();
  document.getElementById("selection-card").scrollIntoView({block: "center"});

});

document.getElementById("to-pumpe").addEventListener("click", function () {

  const tabTrigger = document.querySelector('a[href="#tab-top-3"]');
  const tab = new bootstrap.Tab(tabTrigger);

  tab.show();
  document.getElementById("selection-card").scrollIntoView({block: "center"});

});

document.getElementById("to-results").addEventListener("click", function () {

  document.getElementById("results-card").scrollIntoView({block: "center"});

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
  heating_efficiency : 2.5
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
  const inputField = document.getElementById("energy-use-display");

  // format nicely with thousand separator
  inputField.value = Math.round(energy); //.toLocaleString("de-DE");
}
