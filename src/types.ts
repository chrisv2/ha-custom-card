import { ActionConfig, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';

declare global {
  interface HTMLElementTagNameMap {
    'uplink-switcher-editor': LovelaceCardEditor;
    'hui-error-card': LovelaceCard;
  }
}

export interface UplinkSwitcherCardConfig extends LovelaceCardConfig {
  type: string;
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}


export interface EnterPasswordCardConfig {
  type: string;
  ssid: string;       // ssid to get password for
  entity: string;     // name of the entity to switch
}


export interface BSSEntry {
  freq: string;
  level: string;
  flags: string;
}

export interface NetworkEntry {
  active: boolean;
  level: number;
  netid: string;
  ssid: string;
  bssids: { [key: string]: BSSEntry };

}

export interface NetworkStatus {
  connected: boolean,
  ssid?: string,
  ip_address?: string,
  bssid?: string,
  freq?: string
}