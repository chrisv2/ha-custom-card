/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css, PropertyValues, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction
} from 'custom-card-helpers';

import type { NetworkEntry, NetworkStatus, UplinkSwitcherCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { localize } from './localize/localize';
import { HassEntity } from 'home-assistant-js-websocket';


import { popUp } from 'card-tools/src/popup'

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'uplink-switcher',
  name: 'Uplink-Switcher',
  description: 'Choose Internet Uplink',
});

@customElement('uplink-switcher')
export class UplinkSwitcher extends LitElement {


  /*
  // we don't have a custom editor right now
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./editor');
    return document.createElement('uplink-switcher-editor');
  }
  */

  public static getStubConfig(): Record<string, unknown> {
    return {};
  }

  @property({ attribute: false })
  public hass!: HomeAssistant;

  @state()
  private config!: UplinkSwitcherCardConfig;

  public setConfig(config: UplinkSwitcherCardConfig): void {
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }
    this.config = {
      ...config,
    };
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  protected renderWifiIcon(network: NetworkEntry): TemplateResult {
    // https://www.securedgenetworks.com/blog/wifi-signal-strength#how-do-we-measure-wifi-signal-strength
    const level = network['level'];
    let icon = 'mdi:wifi-strength-4';
    if (level < -100) {
      icon = 'mdi:wifi-strength-outline'
    } else if (level < -85) {
      icon = 'mdi:wifi-strength-1'
    } else if (level < -70) {
      icon = 'mdi:wifi-strength-2'
    } else if (level < -65) {
      icon = 'mdi:wifi-strength-3'
    }
    return html`<ha-icon icon=${icon}></ha-icon>`
  }

  protected getState(): HassEntity | null {
    const entity = this.config.entity,
          stateObj = (entity) ? this.hass.states[entity] : null;
    return stateObj;

  }

  protected getNetworks(): Array<NetworkEntry>{
    const stateObj = this.getState(),
          networks = (stateObj) ? stateObj.attributes.networks : [];

    return Object.keys(networks).map(ssid => networks[ssid]).sort((a, b) => b.level - a.level);
  }

  protected getStatus(): NetworkStatus {
    const stateObj = this.getState(),
          status = (stateObj) ? stateObj.attributes.status : {connected: false};
    return status;
  }

  protected getNetwork(ssid: string): NetworkEntry {
    const stateObj = this.getState(),
          attributes = (stateObj) ? stateObj.attributes : {},
          networks = attributes?.networks,
          network = (networks)?networks[ssid]:null;

    return network
  }

  protected renderWifiList(networks: Array<NetworkEntry>): Array<TemplateResult>{
    return networks.map((network) =>
      html`<mwc-list-item value=${network.ssid} @click=${e => { this.onSelectNetwork(e, network.ssid) }}>
              ${this.renderWifiIcon(network)}
              ${network.ssid}
              <ha-icon icon=${(network.active) ? 'mdi:check' : ''}></ha-icon>
            </mwc-list-item>`
    )
  }

  protected render(): TemplateResult | void {

    if (!this.config.entity) {
      return html`<h1>No entity defined</h1>`
    }

    const networks = this.getNetworks(),
      status = this.getStatus(),
      is_connected = status.connected,
      ssid = status?.ssid;

    return html`
      <ha-card
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config.hold_action),
          hasDoubleClick: hasAction(this.config.double_tap_action),
        })}
        tabindex="0"
        .label=${`Boilerplate: ${this.config.entity || 'No Entity Defined'}`}
      >
      <ha-icon-button>
        <ha-icon icon=${(is_connected)?'mdi:wifi-check':'mdi:wifi-off'}></ha-icon>
      </ha-icon-button>
      <h2>${(ssid)?ssid:"(not connected)"}</h2>
      <mwc-menu class="network-list">
        ${this.renderWifiList(networks)}
      </mwc-menu>
    </ha-card>
    `;
  }

  protected async onSelectNetwork(evt: Event, ssid: string): Promise<void> {
    const network = this.getNetwork(ssid);

    evt.stopPropagation();
    if (network.netid) {
      // trigger switch right away
      this.hass.connection.sendMessagePromise({
        type: 'uplink/select_network',
        entity: this.config.entity,
        ssid: ssid
      })
    } else {
      await import('./enter-password');
      popUp("Enter Wifi Password",  {type: "custom:enter-password", entity: this.config.entity, ssid})
    }
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this.config && ev.detail.action) {
      if (ev.detail.action == 'tap') {
        const anchor = this.shadowRoot?.querySelector('h2'),
              menu = this.shadowRoot?.querySelector('.network-list');
        if (menu) {
          menu['anchor'] = anchor;
          menu['corner'] = 'BOTTOM_START';
          menu['open'] = true;
        }
      } else {
        handleAction(this, this.hass, this.config, ev.detail.action);
      }
    }
  }

  static get styles(): CSSResultGroup {
    return css`
      ha-card {
        text-align: center;
        padding: 16px;
      }
      ha-icon-button {
        --mdc-icon-button-size: 120px;
        --mdc-icon-size: 120px;
      }
    `;
  }
}
