#!/bin/bash
SCRIPT_DIR=$(cd $(dirname $0); pwd)

sleep 10

source /opt/ros/melodic/setup.bash
source /home/rover/catkin_ws/devel/setup.bash
source /home/rover/catkin_ws_isolated/install_isolated/setup.bash

echo pwd | sudo -S chmod 666 /dev/ttyUSB0
roslaunch megarover_samples rosserial.launch &

cd $SCRIPT_DIR
#OBS Studioで2カメラを利用する場合、設定後に下記のコメントアウトを外すと自動実行します。
#sh obs_startup.sh
node ./serverhost.js

