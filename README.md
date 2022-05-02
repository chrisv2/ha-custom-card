# Home Assistant uplink switcher card

Custom card which shows the current uplink and allows to switch WiFi,
based on [boilerplate-card](https://github.com/custom-cards/boilerplate-card).

The general scenario here is that HomeAssistant is running in a mobile environment
(e.g. car or RV/motorhome), which acts as an repeater between an internal network
and an external uplink wifi (for example public wifi). The uplink must be represented
by an entity which has the following properties:

| Property          | Format                         |
|-------------------|--------------------------------|
|`state`            | Name of the wifi, if connected |
|`state_attributes` | see below                      |

## State Attributes

```yaml
status:
  connected: true
  ssid: My Network
networks:
  My Network:
    ssid: My Network
    level: -64
    netid: '0'    # wpa_cli network id
    active: true  # this network is currently active
  Other Network:
    ssid: Other Network
    level: -78
    netid: '3'
    active: false
  Someone else's network:
    ssid: Someone else's network
    level: -67
    netid: null   # this network is not known to wpa_cli
    active: false
```

When a network is selected, we send a message of type `uplink/select_network`.
If the network is not known, a password dialog is shown.

```typescript
this.hass.connection.sendMessagePromise({
   type: 'uplink/select_network',
   ssid: 'the ssid',
   password: 'the password'
})
```

An integration must handle this.