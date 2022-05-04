#!/bin/bash
if [[ $(lsb_release -rs) == "20.04" ]]; then
  echo "Compatible version detected"
else
  echo "Sorry this version of GesEnterprise is not compatible with your server version"
  exit
fi

clear
echo "
------------------------------------------
               GesEnterprise
                    by
                  CloudV
------------------------------------------
Warning: Do not run this file if you're
not sure how to install this software
"
# Is user sudo or root?
if [ "$EUID" -ne 0 ]
  then echo "Please run as root or sudo"
  exit
fi


# Get versions codename
codename=$(lsb_release -cs)
# Requirements: NginX, MongoDB, NodeJS, NPM, Git
# Update all packages
echo "Updating packages"
sudo apt-get update > /dev/null
if [ $? -ne 0 ]; then
    echo "ERROR: apt-get update failed"
    exit
fi

# Install required packages
echo "Installing required packages"
sudo apt-get install wget gnupg2 ca-certificates lsb-release ubuntu-keyring software-properties-common -y > /dev/null
if [ $? -ne 0 ]; then
    echo "ERROR: unable to install required packages"
    exit
fi

# NginX (Engine X, that's how its pronounced)
echo "Installing NginX"
curl -fsSL https://nginx.org/keys/nginx_signing.key | sudo gpg --dearmor | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg > /dev/null
echo deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/mainline/ubuntu $codename nginx > /etc/apt/sources.list.d/nginx-mainline.list
echo -e "Package: *\nPin: origin nginx.org\nPin: release o=nginx\nPin-Priority: 900\n" | sudo tee /etc/apt/preferences.d/99nginx > /dev/null
sudo apt-get update > /dev/null
sudo apt-get install nginx -y > /dev/null
if [ $? -ne 0 ]; then
    echo "ERROR: unable to install NginX"
    exit
fi
echo "Starting NginX"
sudo systemctl daemon-reload > /dev/null
sudo systemctl start nginx > /dev/null
sudo systemctl enable nginx > /dev/null

# NodeJs (latest LTS version, if i remember to change this to the latest LTS version)
nodeVersion=16
curl -fsSL https://deb.nodesource.com/setup_$nodeVersion.x | sudo -E bash - > /dev/null
echo -e "Package: *\nPin: origin deb.nodesource.com\nPin-Priority: 900\n" > /etc/apt/preferences.d/99nodesource
echo "Installing NodeJS $nodeVersion"
sudo apt-get update > /dev/null
sudo apt-get install -y nodejs > /dev/null
if [ $? -ne 0 ]; then
    echo "ERROR: Unable to install NodeJS $nodeVersion"
    exit
fi

# MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-5.0.asc | sudo gpg --dearmor | sudo tee /usr/share/keyrings/mongodb-server-keyring.gpg > /dev/null
echo deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-keyring.gpg] https://repo.mongodb.org/apt/ubuntu $codename/mongodb-org/5.0 multiverse > /etc/apt/sources.list.d/mongodb-server.list
echo "Installing MongoDB"
sudo apt-get update > /dev/null
sudo apt-get install -y mongodb-org > /dev/null
if [ $? -ne 0 ]; then
    echo "ERROR: Unable to install MongoDB"
    exit
fi
echo "Warning: MongoDB is not secured by default"
echo "Starting MongoDB"
sudo systemctl daemon-reload > /dev/null
sudo systemctl start mongod > /dev/null
sudo systemctl enable mongod > /dev/null