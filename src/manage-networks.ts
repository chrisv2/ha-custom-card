import { LitElement, TemplateResult, html, css, CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators";
import { closePopUp } from 'card-tools/src/popup'
import { HomeAssistant } from "custom-card-helpers";
import { EnterPasswordCardConfig, NetworkEntry } from "./types";
import { HassEntity } from "home-assistant-js-websocket";


@customElement('manage-networks')
export class ManageNetworks extends LitElement {

    ssid = "";
    entity = "";

    @property({ attribute: false })
    public hass!: HomeAssistant;

    public setConfig(config: EnterPasswordCardConfig): void {
        this.entity = config.entity;
        this.ssid = config.ssid;
    }

    protected getState(): HassEntity | null {
        const entity = this.entity,
              stateObj = (entity) ? this.hass.states[entity] : null;
        return stateObj;
    }

      protected getNetworks(): Array<NetworkEntry>{
        const stateObj = this.getState(),
              networks = (stateObj) ? stateObj.attributes.networks : [];

        return Object.keys(networks).filter(ssid => networks[ssid].netid).map(ssid => networks[ssid]).sort((a, b) => b.level - a.level);
      }

    protected render(): TemplateResult | void {

        return html`<ha-card>
            <div class=card-content>
                <table>
                    <tbody>
                        ${this.getNetworks().map((network) => html`
                            <tr>
                                <td><ha-icon icon="mdi:wifi"></ha-icon></td>
                                <td>${network.ssid}</td>
                                <td class="action"><mwc-button @click=${e=>this.removeNetwork(e, network.ssid)}><ha-icon icon="mdi:delete"></ha-icon></mwc-button></td>
                            </tr>
                        `)}
                    </tbody>
                </table>
            </div>
            <div class=card-actions>
                <mwc-button unelevated @click=${this.close}>Close</mwc-button>
            </div>
        </ha-card>`
    }

    protected close(): void {
        closePopUp();
    }

    protected removeNetwork(evt: Event, ssid: string):void {
        this.hass.connection.sendMessagePromise({
            type: 'uplink/remove_network',
            entity: this.entity,
            ssid: ssid
        });
        evt.stopPropagation();
        this.close();
    }

    static get styles(): CSSResultGroup {
        return css`
          table {
              width: 100%;
          }
          table .action {
              text-align: right;
          }
          .card-actions {
              padding: 16px;
              text-align: right;
          }
        `;
      }

}