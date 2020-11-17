const fs = require('fs');
const opener = require("opener");
const { exec } = require('child_process')
const admin = require('firebase-admin');

var serviceAccount = require("./(your_ firebase-adminsdk_keyfile).json");
var timerID;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://(your_databaseURL)"
});

var fireStore = admin.firestore();

const COLLECTION_COMMAND="command";
const meetingid = fs.readFileSync(`./meetingid`).toString().split('\n')[0];
console.log(meetingid);

const MEETING_URL = "https://zoom.us/j/"+meetingid;


const cmdRef = fireStore.collection(COLLECTION_COMMAND).doc(meetingid);

main();
openBrowser();
//setInterval(openBrowser,60000*40);	//40分インターバルでzoomを起動させる(あまり有効ではない)


async function main(){
	await cmd_isdid();

	cmdRef.onSnapshot(function(doc) {

		var data=doc.data();
		if(data.isdid===false){
			switch(data.cmd){
				case 'turn_left':
					console.log("turn_left");
					rover_twist(0,15/180*3.14);
					break;
				case 'turn_right':
					console.log("turn_right");
					rover_twist(0,-15/180*3.14);
					break;
				case 'go_fwd':
					console.log("go_fwd");
					rover_twist(0.2,0);
					break;
				case 'go_back':
					console.log("go_back");
					rover_twist(-0.2,0);
					break;
				case 'open_zoom':
					console.log("open_zoom");
					openBrowser();
					break;
				case 'nop':
					console.log("nop");
					break;
				default:
					console.log("unknown command '"+data.cmd+"'");
					break;
			}
			cmd_isdid();
		}
	});

}


async function cmd_isdid(){
  await cmdRef.set({  isdid: true}, { merge: true });
}

const CONTROLL_STOP_INTERVAL=2000;

async function rover_twist(linear_x,angluar_z)
{
	//車輪停止処理を実行予定なら止める
	if(timerID){
		clearTimeout(timerID);
		timerID=undefined;
	}

	timerID = setTimeout(function(){
		exec('rostopic pub -1 /rover_twist geometry_msgs/Twist "{linear:{x: 0.0}, angular:{z: 0.0}}"', (err, stdout, stderr) => {
			if (err) {
				console.log(`stderr: ${stderr}`)
				return
			}
			console.log(`stdout: ${stdout}`);
			});	
	}, CONTROLL_STOP_INTERVAL);

	exec(`rostopic pub -1 /rover_twist geometry_msgs/Twist "{linear:{x: ${linear_x}}, angular:{z: ${angluar_z}}}"`, (err, stdout, stderr) => {
    if (err) {
      console.log(`stderr: ${stderr}`)
      return
    }
		console.log(`stdout: ${stdout}`)

		//一定時間後、止める
  });
}

function openBrowser(){
  console.log("open browser.")
  opener(MEETING_URL);
  setTimeout(function(){
      console.log("exec browser tab close.")
      exec('wmctrl -a firefox; xdotool key Ctrl+w');    
    },5000);
}

