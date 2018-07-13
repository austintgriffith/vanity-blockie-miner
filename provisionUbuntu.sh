#!/bin/bash
sudo apt-get update
sudo apt-get dist-upgrade -y
sudo apt-get upgrade -y
sudo apt-get install build-essential -y
sudo apt-get install python -y
sudo apt-get install -y htop
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install
cd app npm install
cd ..
sudo rm /etc/rc.local
sudo ln -s rc.local /etc/rc.local
