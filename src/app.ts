/*!
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import Users from './users';
import fetch from 'node-fetch';
import Console from './console';
import ArtifactGui from './artifact_gui';
import SpawnableItem from './spawnable_item';

export default class App {
	public assets: MRE.AssetContainer;
	public ourUsers: Users;
	public ourConsole: Console = null;

	public ourItems: SpawnableItem[] = [];

	public boxMesh: MRE.Mesh;
	public sphereMesh: MRE.Mesh;
	
	public redMat: MRE.Material;
	public greenMat: MRE.Material;
	public whiteMat: MRE.Material;
	public blackMat: MRE.Material;
	public grayMat: MRE.Material;
	public darkgrayMat: MRE.Material;
	public grayRedMat: MRE.Material;
	public lightgrayMat: MRE.Material;

	public handMesh: MRE.Mesh = null;
	public handTexture: MRE.Texture = null;
	public handMaterial: MRE.Material = null;

	public urlString = "http://199.19.73.131:3910/music_symbols.json";

	private createMeshAndMaterial(){
		this.boxMesh = this.assets.createBoxMesh('boxMesh', 1.0, 1.0, 1.0);
		this.sphereMesh= this.assets.createSphereMesh('sphereMesh',0.5,10,10);

		this.redMat = this.assets.createMaterial('redmat', {
			color: new MRE.Color4(1, 0, 0)
		});
		this.greenMat = this.assets.createMaterial('greenMat', {
			color: new MRE.Color4(0, 1, 0)
		});
		this.blackMat = this.assets.createMaterial('blackMat', {
			color: new MRE.Color4(0, 0, 0)
		});
		this.whiteMat = this.assets.createMaterial('whiteMat', {
			color: new MRE.Color4(1, 1, 1)
		});
		this.grayMat = this.assets.createMaterial('grayMat', {
			color: new MRE.Color4(0.5, 0.5, 0.5)
		});
		this.grayRedMat = this.assets.createMaterial('grayMat', {
			color: new MRE.Color4(0.5, 0.25, 0.25)
		});
		this.lightgrayMat = this.assets.createMaterial('lightgrayMat', {
			color: new MRE.Color4(0.75, 0.75, 0.75)
		});
		this.darkgrayMat = this.assets.createMaterial('lightgrayMat', {
			color: new MRE.Color4(0.25, 0.25, 0.25)
		});

		const filename = `${this.baseUrl}/` + "hand_grey.png";
		this.handTexture = this.assets.createTexture("hand", {
			uri: filename
		});

		this.handMaterial = this.assets.createMaterial('handMat', {
			color: new MRE.Color4(1, 1, 1),
			mainTextureId: this.handTexture.id
		});

		this.handMesh = this.assets.createBoxMesh('boxMesh', 0.25, 0.1, 0.25);
	}	

	public degToRad(degrees: number) {
		const pi = Math.PI;
		return degrees * (pi / 180);
	}
	
	constructor(public context: MRE.Context, public baseUrl: string, public baseDir: string, params: MRE.ParameterSet) {
		this.ourConsole = new Console(this);
		this.assets = new MRE.AssetContainer(context);
		this.createMeshAndMaterial();

		this.ourUsers = new Users(this);

		this.context.onUserJoined(user => {
			MRE.log.info("app", "user joined: " + user.name);
			this.ourUsers.userJoined(user,false);
		});

		this.context.onUserLeft(user => {
			MRE.log.info("app", "user left: " + user.name);
			this.ourUsers.userLeft(user);
		});

		const urlParam=params["url"];
		
		if(urlParam!==undefined){
			this.urlString=urlParam as string;
			MRE.log.info("app", "getting URL passed in as parameter: " + this.urlString);
		}

		this.context.onStarted(() => this.started());
		this.context.onStopped(() => this.stopped());
	}

	private stopped() {
		MRE.log.info("app", "stopped callback has been called");
	}

	private started() {
		MRE.log.info("app", "started callback has begun");

		this.loadJSON(this.urlString).then(() => {
			MRE.log.info("app", "load of JSON complete");
			const ourArtifactGui = new ArtifactGui(this);
			ourArtifactGui.createAsync(new MRE.Vector3(0, 0.1, 0), "Artifacts");
		}
		);
	}

	async loadJSON(url: string) {
		MRE.log.info("app", "trying to pull json down from: " + url);

		const response=await fetch(url);
		const jsonItems=await response.json();

		for(let i = 0; i < jsonItems.length; i++) {
			const obj = jsonItems[i];
			const item=SpawnableItem.fromJSON(obj);
			MRE.log.info("app",item.toString());
			this.ourItems.push(item);
		}
	}
}
