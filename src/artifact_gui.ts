/*!
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import App from './app';
import Button from './button';
import GuiPanel from './gui_panel';
import SpawnableItem from './spawnable_item';

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
		this.ourApp.ourConsole.logMessage("creating artifact gui");

		const columns=Math.ceil(this.ourApp.ourItems.length/8);

		const columnWidth=0.75;
		const columnSpacing=0.1;
		const totalWidth=columnSpacing*(2.0+(columns-1))+columnWidth*columns;
		const leftEdge=-totalWidth*0.5;
		const firstColumnCenter=leftEdge+columnWidth*0.5+columnSpacing;

		await this.createBackground(pos, name, 1.5, totalWidth);

		const zStart=this.backgroundHeight * 0.5 - 0.3;

		let zPos=zStart;		
		let xPos=firstColumnCenter;

		for(let i=0;i<this.ourApp.ourItems.length;i++){
			const item=this.ourApp.ourItems[i];
			if(i!==0 && i%8===0){
				zPos=zStart;
				xPos+=columnWidth+columnSpacing;
			}

			const pedalButton = new Button(this.ourApp);
			await pedalButton.createAsync(new MRE.Vector3(xPos, 0.025, zPos),
				this.guiBackground.id, item.name, item.name,
				false, this.setDoPedal.bind(this));

			zPos -= 0.15;
		}
	}
}
