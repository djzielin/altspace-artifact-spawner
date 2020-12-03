# altspace-artifact-spawner

This is an Altspace "control panel" that creates a pannel of buttons based on a supplied JSON file. These buttons allow toggling of Altspace Artifacts in the world. Useful for live performances, where objects need to come and go. Buttons should only be visible (and clickable) by elevated users (moderator, presenter or terraformer).

Launches via:
node . PORTNUM

MRE Address (inside Altspace) would be:
ws://SEVER_IP_ADDRESS:PORT?url=http://location/something.json

Example Entry of a button is:
{
	"name": "Lamp",
	"artifact": "1031586780446458167",
	"pos": [2,0,0],
	"rot": [0,0,0],
	"scale": 3
}
