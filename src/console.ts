/*!
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import App from './app';
import Button from './button';

export default class Console {
	private consoleTextActor: MRE.Actor = null;
	private consoleText: string[] = [];
	private consoleOn = false;
	private consoleParent: MRE.Actor=null;
	private ourParent: MRE.Guid;
	
	constructor(private ourApp: App) {
		for (let i = 0; i < 25; i++) {
			this.consoleText.push("");
		}
	}

	public setConsoleOn(b: boolean): void {
		this.consoleOn=b;
		this.consoleParent.appearance.enabled = this.consoleOn;
		this.renderText();
	}

	public async createAsyncItems(pos: MRE.Vector3, ourParent: MRE.Guid) {
		this.ourParent=ourParent;

		this.consoleParent = MRE.Actor.Create(this.ourApp.context, {
			actor: {
				parentId: this.ourParent,
				name: "parent",
				transform: {
					local: {
						position: pos,
						scale: new MRE.Vector3(0.5, 0.5, 0.5)
					}
				},
				appearance: {
					enabled: this.consoleOn
				}
				
			}
		});
		await this.consoleParent.created();

		const consoleBackground = MRE.Actor.Create(this.ourApp.context, {
			actor: {
				parentId: this.consoleParent.id,
				name: "consoleBackground",
				appearance: {
					meshId: this.ourApp.boxMesh.id,
					materialId: this.ourApp.blackMat.id
				},
				transform: {
					local: {
						position: { x: 0, y: 0.05, z: 0 },
						scale: new MRE.Vector3(4.4, 0.1, 2.5)
					}
				}
			}
		});
		await consoleBackground.created();

		this.consoleTextActor = MRE.Actor.Create(this.ourApp.context, {
			actor: {
				parentId: this.consoleParent.id,
				name: 'consoleText',
				text: {
					contents: "test",
					height: 2.0 / 25,
					anchor: MRE.TextAnchorLocation.TopLeft,
					color: new MRE.Color3(1, 1, 1)
				},
				transform: {
					local: {
						position: { x: -(4.4 / 2) + 0.05, y: 0.101, z: (2.5 / 2) - 0.05 },
						rotation: MRE.Quaternion.FromEulerAngles(this.ourApp.degToRad(90), 0, 0)
					}
				}
			}
		});
		await this.consoleTextActor.created();

		this.logMessage("log initialized");

		const button=new Button(this.ourApp);
		await button.createAsync(new MRE.Vector3(-0.7,0,0.3),this.ourParent,"Console On","Console Off",
			this.consoleOn, this.setConsoleOn.bind(this));
	}

	public logMessage(message: string) {
		MRE.log.info("app", message);

		this.consoleText.push(message);
		this.consoleText.shift();

		if (this.consoleOn) {
			this.renderText();
		}
	}

	private renderText() {
		if (!this.consoleTextActor) {
			return;
		}
		
		let combinedText = "";

		for (const s of this.consoleText) {
			combinedText += s.substr(0, 80);
			combinedText += "\n";
		}

		this.consoleTextActor.text.contents = combinedText;
	}
}
