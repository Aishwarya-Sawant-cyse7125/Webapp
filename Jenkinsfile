node {

    stage('Git Checkout'){
      // cleanWs()
      checkout scm
    }
    def committag = sh(returnStdout: true, script: "git rev-parse HEAD").trim()
    stage('Docker Image Build and Push'){
        // build docker image
      def dockerapp = docker.build("${env.DOCKER_REPO}")
      // docker push
      docker.withRegistry('https://registry.hub.docker.com', 'docker-token'){
          dockerapp.push("${committag}")
          // dockerapp.push("latest")
      }
    }
    stage('Find Latest Release and Unzip') {
      withCredentials([usernamePassword(credentialsId: 'gitrepo', usernameVariable : 'USERNAME', passwordVariable: 'GITTOKEN')])
      {
        sh """
          echo "Get the Output\n"
          export OUTPUT=`eval curl -s -u $GITTOKEN:x-oauth-basic https://api.github.com/repos/cyse7125-fall2022-group02/helm-chart/releases/latest | grep 'tag_name' | cut -d '\"' -f4`
          echo \$OUTPUT
          `curl -u $GITTOKEN:x-oauth-basic https://github.com/cyse7125-fall2022-group02/helm-chart/archive/refs/tags/\$OUTPUT.tar.gz -LJOH 'Accept: application/octet-stream'`
          echo "Unzip tar file\n"
          tar -xvf *.tar.gz
          rm -f *tar.gz
          echo "Check if folder is present\n"
          ls -lrt
        """
      }
    }
    stage ('Deploy web application using Helm Chart') {
      withCredentials([string(credentialsId: 'aws-key-id', variable: 'AWS_ACCESS_KEY_ID'),
        string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
      ])
      {
        sh """
          export AWS_DEFAULT_REGION=$AWS_REGION
          kops export kubeconfig --name=$CLUSTER_NAME --state=$KOPS_STATE_STORE --admin
          helm upgrade --install appdeployment --create-namespace --namespace webapp-deploy ./helm-chart-*/appdeployment -f ./helm-chart-*/appdeployment/values-override.yaml --set dockerConfigJson=$dockerConfigJson,configVars.DbFlywayAddress=$DbFlywayAddress,configVars.DbAddress=$DbAddress,configVars.DbPassword=$DbPassword,configVars.KafkaBroker=$KafkaBroker,configVars.ElasticUrl=$ElasticUrl,image.repository=$DOCKER_REPO:${committag}
        """
      }
    }
}