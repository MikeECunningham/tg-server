# Components
This repository is composed of a node.js and express server that hosts the rest endpoints for the Turtle Guardians server.

# Developing

It is highly recommended that a modern IDE like
[Visual Studio Code](https://code.visualstudio.com/) is used to work with the
code.  It will help prevent a lot of programming issues and style issues that
make the code hard to maintain.

# Preparing working environments

Since the modules needed for most of the development environmets are quite large, they are not included in the git repository. Please run
	```yarn install```
to install the necissary components

# Building

To build the application for use, run 
	```yarn build```
and the built js files will reside in the local dist folder
# Testing

Simply run 
    ```shell
    yarn test
    ```

# Dev Running
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# System Prerequisites

## Linux
### Prerequisites
If installing natively, then install required tools:
* npm
    ```shell
    sudo apt install npm
    ```

* node
    ```shell
    nvm install node
    nvm use node
    ``` 

* yarn
    ```shell
    npm install yarn
    ``` 

* mocha
    ```shell
    npm install -g mocha
    ``` 

* pm2
    ```shell
    npm install -g pm2
    ``` 

* mongodb
    ```shell
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv [key]
    echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    ```

* git
    ```shell
    sudo apt-get install git
    ```

## Windows

* npm/node
    Download and install from https://nodejs.org/en/download/

* yarn
    ```shell
    npm install yarn
    ``` 

* mocha
    ```shell
    npm install -g mocha
    ```

* pm2
    ```shell
    npm install -g pm2
    ``` 

* mongodb
    Download and install from https://www.mongodb.com/download-center

* git
    Download and install from https://git-scm.com/download/win
