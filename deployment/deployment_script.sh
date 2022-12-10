#!/bin/bash

kubectl apply -f namespace.yaml

sleep 5

envsubst < configmap.yaml | kubectl apply -f -

kubectl create secret docker-registry regcred --docker-server=docker.io --docker-username=$1 --docker-password=$2 --docker-email=$3 --namespace=$4

kubectl apply -f secret.yaml

kubectl apply -f service.yaml

kubectl apply -f deployment.yaml