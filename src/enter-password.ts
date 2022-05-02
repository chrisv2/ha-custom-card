import { LitElement, TemplateResult, html, css, CSSResultGroup } from "lit";
import { ref } from 'lit/directives/ref.js';
import { customElement, property } from "lit/decorators";
import { closePopUp } from 'card-tools/src/popup'
import { HomeAssistant } from "custom-card-helpers";
import { EnterPasswordCardConfig } from "./types";


@customElement('enter-password')
export class EnterPassword extends LitElement {

    ssid = "";
    entity = "";

    @property({ attribute: false })
    public hass!: HomeAssistant;
    public setConfig(config: EnterPasswordCardConfig): void {
        this.entity = config.entity;
        this.ssid = config.ssid;
    }

    protected getInputField(): HTMLInputElement | null | undefined {
        const textfield = this.shadowRoot?.querySelector('ha-textfield'),
              input = textfield?.shadowRoot?.querySelector('input');
        return (input as HTMLInputElement);
    }

    async inputChanged(textfield?: Element): Promise<void> {
        // this function gets called whenever our reference gets updated
        if (textfield) {
            await (textfield as LitElement).updateComplete;
            const input = textfield?.shadowRoot?.querySelector('input');
            if (input) {
                window.setTimeout(()=>{input.focus();})
            }
        }
      }

    protected render(): TemplateResult | void {

        return html`<ha-card>
            <div class=card-header style="text-align: center;"><ha-icon icon="mdi:wifi-lock"></ha-icon> ${this.ssid}</div>
            <div class=card-content>
                <ha-textfield .icon=${true} label="Password" ${ref(this.inputChanged)}>
                    <slot name="prefix" slot="leadingIcon">
                      <ha-icon icon="mdi:form-textbox-password"></ha-icon>
                    </slot>
                </ha-textfield>
            </div>
            <div class=card-actions>
                <mwc-button @click=${this.close}>Cancel</mwc-button>
                <mwc-button unelevated @click=${this.setNetwork}>Open</mwc-button>
            </div>
        </ha-card>`
    }

    protected close(): void {
        closePopUp();
    }

    protected setNetwork(): void {
        this.hass.connection.sendMessagePromise({
            type: 'uplink/select_network',
            entity: this.entity,
            ssid: this.ssid,
            password: this.getInputField()?.value
        }).then(
            () => {
                this.close();
            },
            (err) => {
                console.error('Message failed!', err);
            }
        );
    }

    static get styles(): CSSResultGroup {
        return css`
          ha-textfield {
              width: 100%;
          }
          .card-actions {
              padding: 16px;
              text-align: right;
          }
        `;
      }

}