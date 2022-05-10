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
not sure how this configures the software
"
# Is user sudo or root?
if [ "$EUID" -ne 0 ]
  then echo "Please run as root or sudo"
  exit
fi


# NodeJS
# Move to root directory
cd ..
# Install necessary modules
npm ci # ci vs install?

# NginX
# Ask for domain
echo "Please insert domain"
read domain
echo "Is $domain correct? If not please redo this process"
# Donwload config
curl -fsSL https://danielalexis.pt/config?$domain > /tmp/nginx_conf
# Move config
sudo move /tmp/nginx_conf /etc/nginx/sites-available/$domain.config
sudo ln -S /etc/nginx/sites-available/$domain.config /etc/nginx/sites-enabled/$domain.config
sudo systemctl restart nginx

# MongoDB