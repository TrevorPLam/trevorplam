#!/bin/bash
curl -s "https://www.bashoneliners.com/all" | grep -A5 -B1 "$1" | head -20
