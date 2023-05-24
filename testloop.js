function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let _lastApiRequest;
let _allMetrics = null;
let _fetchingMetrics = false;

test();

async function test() {

  for (let i = 0; i <= 10; i++) {

    await Promise.all([
      getAndLogMetric('A_CYC_TEMP_EXTRACT_AIR'),
      getAndLogMetric('A_CYC_TEMP_EXHAUST_AIR'),
      getAndLogMetric('A_CYC_TEMP_OUTDOOR_AIR'),
      getAndLogMetric('A_CYC_TEMP_SUPPLY_AIR'),
    ]);

    console.log('    --------------------');
    await sleep(1000);
  }
}

async function getAndLogMetric(metric) {
  const value = await getMetric(metric);
  console.log('    ' + metric + ' ' + value);
}

async function getMetric(metric) {

  const hasCache = _allMetrics !== null;

  if (!_fetchingMetrics) {

    // check if cache needs to be renewed (after 3 seconds)
    const isOldCache = (Date.now() - _lastApiRequest) > 3000;

    if (!hasCache || isOldCache) {
      _fetchingMetrics = true;

      console.log('Fetching metrics');
      await fetchMetrics();

      _fetchingMetrics = false;
    }
  }

  return hasCache ? _allMetrics[metric] : 0;
}

async function fetchMetrics() {

  try {
    const Vallox = require('@danielbayerlein/vallox-api');
    const valloxService = new Vallox({ ip: '192.168.0.9', port: 80 });

    const start = Date.now();
    _allMetrics = await valloxService.fetchMetrics([
      'A_CYC_TEMP_EXTRACT_AIR',
      'A_CYC_TEMP_EXHAUST_AIR',
      'A_CYC_TEMP_OUTDOOR_AIR',
      'A_CYC_TEMP_SUPPLY_AIR',
      'A_CYC_ANALOG_SENSOR_INPUT',
      'A_CYC_HOME_SPEED_SETTING',
      'A_CYC_BOOST_SPEED_SETTING',
      'A_CYC_AWAY_SPEED_SETTING',
    ]);

    //await sleep(4000);

    console.log('Done. Took ' + (Date.now() - start) / 1000 + ' seconds');

    _lastApiRequest = Date.now();
  } catch (e) {
    if (typeof e === 'string') {
      console.log(e.toUpperCase());
    } else if (e instanceof Error) {
      console.log(e.message);
    }
  }
}