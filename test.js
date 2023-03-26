test();

async function test () {
  const Vallox = require('@danielbayerlein/vallox-api');
  const valloxService = new Vallox({ ip: '192.168.0.9', port: 80 });

  const start = Date.now();
  let v = await valloxService.fetchMetrics([
    'A_CYC_TEMP_EXTRACT_AIR',
    'A_CYC_TEMP_EXHAUST_AIR',
    'A_CYC_TEMP_OUTDOOR_AIR',
    'A_CYC_TEMP_SUPPLY_AIR',
    'A_CYC_ANALOG_SENSOR_INPUT',
    'A_CYC_HOME_SPEED_SETTING',
    'A_CYC_BOOST_SPEED_SETTING',
    'A_CYC_AWAY_SPEED_SETTING',
  ]);
  console.log('Done. Took ' + (Date.now() - start) / 1000 + ' seconds');
  console.log(typeof(v));
  console.log(v['A_CYC_TEMP_SUPPLY_AIR']);
}

// A_CYC_SUPP_FAN_SPEED: 1364,
// A_CYC_RH_VALUE: 54,
// A_CYC_CO2_VALUE: 0,
// A_CYC_FIREPLACE_SWITCH: 0,
// A_CYC_DIGITAL_INPUT: 0,
// A_CYC_ANALOG_CTRL_INPUT: 0,
// A_CYC_POST_HEATING_TRIM: 65535,
// A_CYC_PWM_OFFSET_TRIM: 65535,
// A_CYC_DEFROST_TRIM: 54,
// A_CYC_VOLTAGE_LOW: 0,
// A_CYC_ANALOG_SENSOR_INPUT: 54,
