import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import Vallox from '@danielbayerlein/vallox-api';
import { ValloxPlatform } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class ValloxAccessory {
  private fanService: Service;
  private boostSwitchService: Service;
  private awaySwitchService: Service;
  private fireplaceSwitchService: Service;

  constructor(
    private readonly platform: ValloxPlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    const valloxService = new Vallox({ ip: platform.config.ip, port: platform.config.port });

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Vallox');

    this.fanService = this.accessory.getService(this.platform.Service.Fanv2) || this.accessory.addService(this.platform.Service.Fanv2);
    this.fanService.setCharacteristic(this.platform.Characteristic.Name, 'Rotation speed');

    // fan device to control the fan speed
    // see https://developers.homebridge.io/#/service/Fanv2
    this.fanService.getCharacteristic(this.platform.Characteristic.Active)
      .onGet(async () => {
        const value = await getFanSpeedOfCurrentProfile(valloxService);
        return value > 0;
      })
      .onSet(async (value: CharacteristicValue) => {
        const active = value ? 40 : 0;
        await setFanSpeedOfCurrentProfile(valloxService, active);
      });

    this.fanService.getCharacteristic(this.platform.Characteristic.RotationSpeed)
      .onGet(async () => {
        return await getFanSpeedOfCurrentProfile(valloxService);
      })
      .onSet(async (value: CharacteristicValue) => {
        await setFanSpeedOfCurrentProfile(valloxService, value);
      });

    // Switch for BOOST profile
    // see https://developers.homebridge.io/#/service/Switch
    this.boostSwitchService = this.accessory.getServiceById(this.platform.Service.Switch, 'Boost')
      ?? this.accessory.addService(new this.platform.Service.Switch('Vallox Profile Boost', 'Boost'));
    this.boostSwitchService.setCharacteristic(this.platform.Characteristic.Name, 'Vallox Profile Boost');

    this.boostSwitchService.getCharacteristic(this.platform.Characteristic.On)
      .onGet(async () => {
        const profile = await valloxService.getProfile();
        return profile === valloxService.PROFILES.BOOST ? 1 : 0;
      })
      .onSet(async (value: CharacteristicValue) => {
        const profile = value ? valloxService.PROFILES.BOOST : valloxService.PROFILES.HOME;
        await valloxService.setProfile(profile);
      });

    // Switch for AWAY profile
    // see https://developers.homebridge.io/#/service/Switch
    this.awaySwitchService = this.accessory.getServiceById(this.platform.Service.Switch, 'Away')
      ?? this.accessory.addService(new this.platform.Service.Switch('Vallox Profile Away', 'Away'));
    this.awaySwitchService.setCharacteristic(this.platform.Characteristic.Name, 'Vallox Profile Away');

    this.awaySwitchService.getCharacteristic(this.platform.Characteristic.On)
      .onGet(async () => {
        const profile = await valloxService.getProfile();
        return profile === valloxService.PROFILES.AWAY ? 1 : 0;
      })
      .onSet(async (value: CharacteristicValue) => {
        const profile = value ? valloxService.PROFILES.AWAY : valloxService.PROFILES.HOME;
        await valloxService.setProfile(profile);
      });

    // Switch for FIREPLACE profile
    // see https://developers.homebridge.io/#/service/Switch
    this.fireplaceSwitchService = this.accessory.getServiceById(this.platform.Service.Switch, 'Fireplace')
      ?? this.accessory.addService(new this.platform.Service.Switch('Vallox Profile Fireplace', 'Fireplace'));
    this.fireplaceSwitchService.setCharacteristic(this.platform.Characteristic.Name, 'Vallox Profile Fireplace');

    this.fireplaceSwitchService.getCharacteristic(this.platform.Characteristic.On)
      .onGet(async () => {
        const profile = await valloxService.getProfile();
        return profile === valloxService.PROFILES.FIREPLACE ? 1 : 0;
      })
      .onSet(async (value: CharacteristicValue) => {
        const profile = value ? valloxService.PROFILES.FIREPLACE : valloxService.PROFILES.HOME;
        await valloxService.setProfile(profile);
      });
  }
}

async function getFanSpeedMetricByCurrentProfile(valloxService: Vallox) {

  const profile = await valloxService.getProfile();

  let metric = 'A_CYC_HOME_SPEED_SETTING';
  if (profile === valloxService.PROFILES.BOOST) {
    metric = 'A_CYC_BOOST_SPEED_SETTING';
  } else if (profile === valloxService.PROFILES.AWAY) {
    metric = 'A_CYC_AWAY_SPEED_SETTING';
  } else if (profile === valloxService.PROFILES.FIREPLACE) {
    metric = ''; // n/a
  }

  return metric;
}

async function getFanSpeedOfCurrentProfile(valloxService: Vallox) {

  const metric = await getFanSpeedMetricByCurrentProfile(valloxService);

  if (metric === '') {
    return 0;
  }

  return await valloxService.fetchMetric(metric);
}

async function setFanSpeedOfCurrentProfile(valloxService: Vallox, value: CharacteristicValue) {
  const metric = await getFanSpeedMetricByCurrentProfile(valloxService);
  if (metric !== '') {
    await valloxService.setValues({ [metric]: value });
  }
}

// more info on settings at https://github.com/yozik04/vallox_websocket_api

// # Setting Home profile fan speed
// await client.setValues({'A_CYC_HOME_SPEED_SETTING': 10})

// # Setting Home profile target temperature
// await client.setValues({'A_CYC_HOME_AIR_TEMP_TARGET': 15})


// # Setting Away profile fan speed
// await client.setValues({'A_CYC_AWAY_SPEED_SETTING': 10})

// # Setting Away profile target temperature
// await client.setValues({'A_CYC_AWAY_AIR_TEMP_TARGET': 15})


// # Setting Boost profile fan speed
// await client.setValues({'A_CYC_BOOST_SPEED_SETTING': 10})

// # Setting Boost profile target temperature
// await client.setValues({'A_CYC_BOOST_AIR_TEMP_TARGET': 15})

// # Setting Boost profile timer
// await client.setValues({
//   'A_CYC_BOOST_TIMER': 30, #Minutes
// })

// # Setting Fireplace profile fan speeds
// await client.setValues({
//   'A_CYC_FIREPLACE_EXTR_FAN': 50,
//   'A_CYC_FIREPLACE_SUPP_FAN': 50
// })

// # Setting Fireplace profile timer
// await client.setValues({
//   'A_CYC_FIREPLACE_TIMER': 15, #Minutes
// })