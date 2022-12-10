## KUBERNETES DEPLOYMENT <br/><hr>

### GET CLUSTER UP AND RUNNING
1. Create Cluster-vpc resources using kops
```
kops create cluster \
--zones=$Node_Zones \
--name=${KOPS_CLUSTER_NAME} \
--node-count=$Node_Count \
--node-size=$Node_Size \
--node-volume-size=$Node_Volume \
--master-size=$Master_Instance_Type \
--master-count=$Master_Count \
--master-volume-size=$Master_Volume_Size \
--master-zones=$Master_Zones \
--ssh-public-key=$Public_Key \
--kubernetes-version=$Kubernetes_version \
--authorization=alwaysAllow \
--cloud=aws \
--dns-zone=${KOPS_CLUSTER_NAME} \
--associate-public-ip=false \
--topology=private \
--networking=calico \
--image=ami-08c40ec9ead489470 \
--bastion=true \
--out=. \
--target=terraform
--yes
```
2. Run `terraform init`, `terraform plan`, `terraform apply`
3. Export to config ```kops export kubeconfig <cluster-name> --state=<s3-bucket-name> --admin```
4. Check config ```kubectl config view``` <br/><br/>

### KUBECTL COMMANDS (TO GET INFO ABOUT CLUSTER)
1. Validate Cluster - `kops validate cluster --wait 10m`
2. Get cluster info - `kubectl cluster-info`
3. List nodes - `kubectl get nodes`
4. List pods - `kubectl get pods --namespace`
5. List Services - `kubectl get services --namespace`
6. List deployment - `kubectl get deployment deployment-name`
7. Port forwarding - `kubectl port-forward service/webappservice 3200:3200 --namespace=assignment4-grp2` <br/><br/>

### Deployment Commands
1. To apply deployment - `envsubst < deployment.yaml | kubectl apply -f -`
2. To jumpstart a kubernetes local dashboard - `cd /deployments > sh install-k8s-dashboard.sh` 
3. Delete Service - `kubectl delete -n assignment4-grp2 service webappservice`
4. Delete ConfigMap - `kubectl delete -n assignment4-grp2 configmap appconfig`
5. Delete Secrets - `kubectl delete -n assignment4-grp2 secret secretapp`
6. Delete Deployment - `kubectl delete -n assignment4-grp2 deployment appdeployment` <br/><br/>

## WEBAPP API <br/><hr>

### USER AUTH (Basic Auth)
Use Postman Authorization (Basic Auth) with login credentials after signup to access the apis <br/><br/>

### USER API
    
`--request GET --url /v1/user --data '{"username": string, "password": string}'` <br/>

`--request POST --url /v1/user/self --data '{"firstname": string, "lastname": string,
"middlename": string, "emailid": string, "password": string}'
` </br>

`--request PUT --url /v1/user/self --data '{"firstname": string, "lastname": string,
"middlename": string, "emailid": string, "password": string}'
` </br></br>

### LIST API

`--request GET --url /v1/user/self/getAllTodoLists --data '{}'` <br/>

`--request GET --url /v1/user/self/list --data '{"listid": uuid}'` <br/>

`--request POST --url /v1/user/self/list --data '{"listname": string}'` </br>

`--request PUT --url /v1/user/self/list --data '{"listid": uid, "listname": string}'` </br>

`--request DELETE --url /v1/user/self/list --data '{"listid": uuid}'` <br/></br>

### TASK API

`--request GET --url /v1/user/self/getAllTasks --data '{"listid": uuid}'` <br/>

`--request GET --url /v1/user/self/task --data '{"taskid": uuid}'` <br/>

`--request POST --url /v1/user/self/task --data '{"listid": uuid, "summary": string,
"task": string, "dueDate": string, "priority": string}'
` </br>

`--request PUT --url /v1/user/self/task --data '{"taskid": uuid, "summary": string,
"task": string, "dueDate": string, "priority": string, "state": string}'
` </br>

`--request PUT --url /v1/user/self/moveTask --data '{"taskid": uuid, "newListId": uuid}'` </br>

`--request DELETE --url /v1/user/self/task --data '{"taskid": uuid}'` <br/></br>

### TAGS API

`--request GET --url /v1/user/self/getTaskTags --data '{"taskid": uuid}'` <br/>

`--request GET --url /v1/user/self/getUserTags --data '{"userid": uuid}'` <br/>

`--request POST --url /v1/user/self/tag --data '{"taskid": uuid, "tagname": string}'` </br>

`--request PUT --url /v1/user/self/tag --data '{"tagname": string, "newtagname": string}'` </br>

`--request DELETE --url /v1/user/self/tag --data '{"taskid": uuid, "tagname": string}'` </br></br>

### COMMENTS API

`--request GET --url /v1/user/self/getAllComments --data '{"taskid": uuid}'` <br/>

`--request POST --url /v1/user/self/comment --data '{"taskid": uuid, "comment": string}'` <br/>

`--request DELETE --url /v1/user/comment --data '{"commentid": uuid}'` </br>

`Delete All Comments --request DELETE --url /v1/user/comment --data '{"taskid": uuid}'` </br></br>

### REMINDERS API

`--request GET --url /v1/user/self/getAllReminders --data '{"taskid": uuid}'` <br/>

`--request POST --url /v1/user/self/reminder --data '{"taskid": uuid, "reminderdate": string}'` <br/>

`--request DELETE --url /v1/user/reminder --data '{"reminderid": uuid}'` </br>

`Delete All Reminders --request DELETE --url /v1/user/reminder --data '{"taskid": uuid}'` </br>

## Ci CD for helm builds and building a docker image and getting an ID