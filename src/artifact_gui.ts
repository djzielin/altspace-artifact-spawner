/*!
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import App from './app';
import Button from './button';
import GuiPanel from './gui_panel';

export default class ArtifactGui extends GuiPanel{
	private resetButton: Button=null;
	public receiveButton: Button=null;

	constructor(protected ourApp: App) {
		super(ourApp);
	}

	public setDoPedal(b: boolean): void {
		//this.ourWavPlayer.doPedal=b;
	}

	public async createAsync(pos: MRE.Vector3, name: string) {
		this.ourApp.ourConsole.logMessage("creating wav player gui");

		await this.createBackground(pos, name, 1.5, 3.0);

		let zPos=this.backgroundHeight * 0.5 - 0.3;

		const pedalButton = new Button(this.ourApp);
		await pedalButton.createAsync(new MRE.Vector3(0, 0.025, zPos),
			this.guiBackground.id, "do Pedal", "no Pedal",
			true, this.setDoPedal.bind(this));
		zPos -= 0.15;
		
		//this.guiGrabber.setGrabReleaseCallback(this.grabRelease.bind(this));
	}
}
