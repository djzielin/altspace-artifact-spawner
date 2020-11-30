/*!
 * Licensed under the MIT License.
 */
export default class SpawnableItem {
	public name: string;
	public artifact: string;
	public pos: number[]=[];
	public rot: number[]=[];
	public scale=1.0;

	static fromJSON(d: any) {
		return Object.assign(new SpawnableItem(), d);
	}

	public toString(): string {
		const s = "Name: " + this.name + "\n" +
			"Artifact: " + this.artifact + "\n" +
			"Pos: " + this.pos.toString() + "\n" +
			"Rot: " + this.rot.toString() + "\n" +
			"Scale: " + this.scale;

		return s;
	}
}
