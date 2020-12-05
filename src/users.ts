/*!
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import App from './app';

interface UserProperties {
	name: string;
	user: MRE.User;
	userID: MRE.Guid;
	lHand: MRE.Actor;
	rHand: MRE.Actor;
	isElevated: boolean;
}

export default class Users {

	public allUsers: UserProperties[] = [];
	public elevatedUsers: string[] = [];

	constructor(private ourApp: App) {

	}

	public showHands() {
		for (const user of this.allUsers) {
			if (user.lHand) {
				user.lHand.appearance.enabled = true;
			}
			if (user.rHand) {
				user.rHand.appearance.enabled = true;
			}
		}
	}

	public isElevated(user: MRE.User): boolean {
		const ourRoles = user.properties["altspacevr-roles"];

		if(!ourRoles){
			return false;
		}

		/*if (ourRoles.includes("moderator") || ourRoles.includes("presenter") ||
			ourRoles.includes("terraformer")) {
			return true;
		}*/
		if (ourRoles.includes("presenter")) {
			return true;
		}

		return false;
	}

	public isElevatedString(user: string): boolean {
		if (this.elevatedUsers.includes(user)) {
			//this.ourConsole.logMessage("user is moderator based on GUID");
			return true;
		}

		//this.ourConsole.logMessage("user is NOT moderator based on GUID");
		return false;
	}

	public getElevatedUsersGroupMask(): MRE.GroupMask{
		return new MRE.GroupMask(this.ourApp.context, ['presenters']);
	}

	public userJoined(user: MRE.User, createHands: boolean) {
		MRE.log.info("app", "user joined. name: " + user.name + " id: " + user.id);

		let isElevated = false

		if (this.isElevated(user)) {
			MRE.log.info("app", "  user is authorized");
			isElevated = true;
		} else{
			MRE.log.info("app", "  user is NOT authorized");
		}

		const rHand: MRE.Actor = null;
		const lHand: MRE.Actor = null;

		const ourUser = {
			name: user.name,
			user: user,
			userID: user.id,
			rHand: rHand,
			lHand: lHand,
			isElevated: isElevated
		}
		this.allUsers.push(ourUser);

		if (isElevated) {
			this.elevatedUsers.push(user.id.toString());
			user.groups.add('presenters');
		}

		if(createHands){
			this.addHands(ourUser);
		}

		MRE.log.info("app", "  finished adding user: " + user.name);
	}

	public findUserRecord(userID: MRE.Guid): UserProperties {
		for (let i = 0; i < this.allUsers.length; i++) {
			const ourUser = this.allUsers[i];
			if (ourUser.userID === userID) {
				return ourUser;
			}
		}

		MRE.log.info("app", "ERROR: can't find userID: " + userID);
		return null;
	}	

	public userLeft(user: MRE.User) {
		MRE.log.info("app", "user left. name: " + user.name + " id: " + user.id);
		MRE.log.info("app", "  user array pre-deletion is size: " + this.allUsers.length);

		for (let i = 0; i < this.allUsers.length; i++) {
			const ourUser = this.allUsers[i];

			if (ourUser.userID === user.id) {				
				this.allUsers.splice(i, 1);

				if (ourUser.isElevated) {
					const userString = user.id.toString();

					const index = this.elevatedUsers.indexOf(userString);
					if (index !== -1) {
						this.elevatedUsers.splice(index, 1);
						MRE.log.info("app", "  removed user from moderator string list");
					}
				}

				//this.removeHands(ourUser.lHand,ourUser.rHand);

				break;
			}
		}

		MRE.log.info("app", "  user array is now size: " + this.allUsers.length);
	}

	private addHands(ourUser: UserProperties) {
		MRE.log.info("app", "creating hands for: " + ourUser.name);

		ourUser.rHand = this.createHand('right-hand', ourUser.userID, new MRE.Vector3(0, 0, 0.1),
			new MRE.Vector3(0.03, 0.03, 0.14));

		ourUser.lHand = this.createHand('left-hand', ourUser.userID, new MRE.Vector3(0, 0, 0.1),
			new MRE.Vector3(0.03, 0.03, 0.14));

		MRE.log.info("app", "  hands created for: " + ourUser.name);		
	}

	private createHand(aPoint: string, userID: MRE.Guid, handPos: MRE.Vector3, handScale: MRE.Vector3) {
		const hand = MRE.Actor.Create(this.ourApp.context, {
			actor: {
				name: 'SpawnerUserHand_' + userID.toString(),
				transform: {
					local: {
						position: handPos,
						scale: handScale
					}
				},
				attachment: {
					attachPoint: aPoint as MRE.AttachPoint,
					userId: userID
				},
				appearance:
				{
					meshId: this.ourApp.boxMesh.id,
					enabled: false
				},
				collider: {
					geometry: {
						shape: MRE.ColliderType.Box
					},
					isTrigger: false
				},
				rigidBody: {
					enabled: true,
					isKinematic: true
				}
			}
		});

		//hand.subscribe('transform');
		//hand.subscribe('rigidbody');
		//hand.subscribe('collider');

		return hand;
	}

	private removeHands(leftHand: MRE.Actor, rightHand: MRE.Actor) {
		if (leftHand) {
			//leftHand.rigidBody.enabled=false;
			//leftHand.collider.enabled=false;
			//leftHand.detach();
			leftHand.destroy();
		}
		if (rightHand) {
			//rightHand.rigidBody.enabled=false;
			//rightHand.collider.enabled=false;
			//rightHand.detach();
			rightHand.destroy();
		}
	}
}
