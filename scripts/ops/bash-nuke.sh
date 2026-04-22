#!/bin/bash
case $1 in
  k8s) kubectl delete ns $(kubectl get ns -o name | grep -v kube-system) --ignore-not-found ;;
  docker) docker image prune -a -f --filter "until=48h" ;;
  logs) find /var/log -name "*.log" -mtime +7 -delete ;;
  *) echo "Usage: bash-nuke {k8s|docker|logs}" ;;
esac
