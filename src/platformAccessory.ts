import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import Vallox from '@danielbayerlein/vallox-api';
import { ValloxPlatform } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class ValloxAccessory {
  private service: Service;

  constructor(
    private readonly platform: ValloxPlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    const valloxService = new Vallox({ ip: platform.config.ip, port: platform.config.port });

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Vallox');

    this.service = this.accessory.getService(this.platform.Service.Fanv2) || this.accessory.addService(this.platform.Service.Fanv2);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.Name);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Fanv2

    this.service.getCharacteristic(this.platform.Characteristic.Active)
      .onGet(async () => {
        const value = await valloxService.fetchMetric('A_CYC_HOME_SPEED_SETTING');
        return value > 0;
      })
      .onSet(async (value: CharacteristicValue) => {
        const active = value ? 40 : 0;
        await valloxService.setValues({ A_CYC_HOME_SPEED_SETTING: active });
      });

    this.service.getCharacteristic(this.platform.Characteristic.RotationSpeed)
      .onGet(async () => {
        return await valloxService.fetchMetric('A_CYC_HOME_SPEED_SETTING');
      })
      .onSet(async (value: CharacteristicValue) => {
        await valloxService.setValues({ A_CYC_HOME_SPEED_SETTING: value });
      });
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