/*!
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { Quaternion } from '@microsoft/mixed-reality-extension-sdk';
import App from './app';
import ButtonWithParameter from './button_with_parameter';
import GuiPanel from './gui_panel';
import SpawnableItem from './spawnable_item';
import Button from './button';

export default class ArtifactGui extends GuiPanel{

	private activeObjects: Map<number,MRE.Actor> = new Map();


	constructor(protected ourApp: App) {
		super(ourApp);
	}

	private deleteSpawnedObject(buttonIndex: number){
		if(this.activeObjects.has(buttonIndex)){
			this.ourApp.ourConsole.logMessage("destroying: " + buttonIndex);
			this.activeObjects.get(buttonIndex).destroy();
			this.activeObjects.delete(buttonIndex); //just to be cleaner
		}
	}

	private doReset() {
		process.exit(0);
	}

	public ButtonPressed(b: boolean, param: any): void {
		const buttonIndex=param as number;
		this.ourApp.ourConsole.logMessage("got button change for: " + buttonIndex + " value: " + b);
		const item = this.ourApp.ourItems[buttonIndex];

		if (b) {
			this.deleteSpawnedObject(buttonIndex); //just to make sure

			this.ourApp.ourConsole.logMessage("spawning: " + item.name);

			const rot = Quaternion.FromEulerAngles(this.ourApp.degToRad(item.rot[0]),
				this.ourApp.degToRad(item.rot[1]),
				this.ourApp.degToRad(item.rot[2]));

			const spawnedActor = MRE.Actor.CreateFromLibrary(this.ourApp.context, {
				resourceId: "artifact:" + item.artifact,
				actor: {
					name: item.name,
					transform: {
						local: {
							position: { x: item.pos[0], y: item.pos[1], z: item.pos[2] },
							rotation: rot,
							scale: { x: item.scale, y: item.scale, z: item.scale }
						}
					}
				}
			});

			this.activeObjects.set(buttonIndex,spawnedActor);
		} else{
			this.deleteSpawnedObject(buttonIndex);
		}
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

			const pedalButton = new ButtonWithParameter(this.ourApp, i);
			await pedalButton.createAsync(new MRE.Vector3(xPos, 0.025, zPos),
				this.guiBackground.id, item.name, item.name,
				false, this.ButtonPressed.bind(this));

			zPos -= 0.15;
		}

		const resetButton = new Button(this.ourApp);
		await resetButton.createAsync(new MRE.Vector3(2, 0, 0), this.guiBackground.id, "Reset", "Reset",
			false, this.doReset.bind(this),0.45,0.45);

		resetButton.setModeratorOnlyVisibility();
		this.setModeratorOnlyVisibility(); //new magic to make visible only to elevated users
	}
}
