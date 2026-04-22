#!/bin/bash
flux bootstrap github --owner=$GITHUB_USER --repository=$REPO --branch=main --path=./clusters/prod
