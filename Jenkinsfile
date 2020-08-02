pipeline {
    agent any

    environment {
        NODE_PATH '/usr/lib/node_modules/'
    }

    stages {
      	stage('SonarQube analysis') {
          	steps {
              	script {
                	def scannerHome = tool 'Jenkins scanner';
              		withSonarQubeEnv('Jenkins SonarQube') {
                  		sh "${scannerHome}/bin/sonar-scanner"
                    }
              	}
          	}
    	}
        stage('Build') {
            steps {
                ansiColor('xterm'){
                    sh 'docker-compose down'
                    sh 'docker-compose build --no-cache'
                }
            }
        }
        stage('Test') {
            steps {
                ansiColor('xterm'){
                    sh 'docker-compose run webapp yarn test'
                }
            }
        }
        
        stage('Clean') {
            steps {
                ansiColor('xterm'){
                    sh 'docker-compose down --rmi local'
                }
            }
        }
    }
}
