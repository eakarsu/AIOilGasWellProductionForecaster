const router = require('express').Router();
const auth = require('../middleware/auth');

// All conversions go through a base unit per category
const conversions = {
  pressure: {
    PSI: 1,
    bar: 14.5038,
    kPa: 0.145038,
    atm: 14.6959
  },
  temperature: {
    // Handled separately due to non-linear conversions
  },
  volume: {
    barrels: 1,
    gallons: 0.0238095,
    liters: 0.00628981,
    'cubic meters': 6.28981
  },
  flow_rate: {
    BPD: 1,
    GPM: 34.2857,
    'm3/day': 6.28981,
    'liters/min': 0.00436644
  },
  length: {
    feet: 1,
    meters: 3.28084,
    inches: 0.0833333,
    centimeters: 0.0328084
  },
  weight: {
    pounds: 1,
    kilograms: 2.20462,
    tons: 2204.62
  }
};

function findCategory(unit) {
  for (const [category, units] of Object.entries(conversions)) {
    if (category === 'temperature') {
      if (['Fahrenheit', 'Celsius', 'Kelvin'].includes(unit)) return 'temperature';
      continue;
    }
    if (units[unit] !== undefined) return category;
  }
  return null;
}

function convertTemperature(value, fromUnit, toUnit) {
  // Convert to Celsius first
  let celsius;
  if (fromUnit === 'Fahrenheit') celsius = (value - 32) * 5 / 9;
  else if (fromUnit === 'Kelvin') celsius = value - 273.15;
  else celsius = value;

  // Convert from Celsius to target
  if (toUnit === 'Fahrenheit') return celsius * 9 / 5 + 32;
  if (toUnit === 'Kelvin') return celsius + 273.15;
  return celsius;
}

function convert(value, fromUnit, toUnit) {
  const category = findCategory(fromUnit);
  if (!category) return null;
  if (findCategory(toUnit) !== category) return null;

  if (category === 'temperature') {
    return convertTemperature(value, fromUnit, toUnit);
  }

  const units = conversions[category];
  // Convert from source to base unit, then from base to target
  const baseValue = value * units[fromUnit];
  const result = baseValue / units[toUnit];
  return result;
}

router.post('/convert', auth, async (req, res) => {
  try {
    const { value, fromUnit, toUnit } = req.body;
    if (value === undefined || !fromUnit || !toUnit) {
      return res.status(400).json({ error: 'value, fromUnit, and toUnit are required' });
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return res.status(400).json({ error: 'value must be a number' });
    }

    const fromCategory = findCategory(fromUnit);
    const toCategory = findCategory(toUnit);
    if (!fromCategory || !toCategory) {
      return res.status(400).json({ error: 'Unsupported unit' });
    }
    if (fromCategory !== toCategory) {
      return res.status(400).json({ error: 'Cannot convert between different unit categories' });
    }

    const result = convert(numValue, fromUnit, toUnit);
    res.json({ value: numValue, fromUnit, toUnit, result: Math.round(result * 1000000) / 1000000 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
