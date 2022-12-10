#!/bin/bash

kubectl delete -n assignment4-grp2 configmap appconfig
kubectl delete -n assignment4-grp2 secret secretapp
kubectl delete -n assignment4-grp2 deployment appdeployment
kubectl delete -n assignment4-grp2 secret regcred
kubectl delete -n assignment4-grp2 service webappservice
kubectl delete namespace assignment4-grp2
