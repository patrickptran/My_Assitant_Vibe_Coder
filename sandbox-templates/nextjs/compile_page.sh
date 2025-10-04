#!/bin/bash

function ping_server(){
    counter=0
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
    while [ "$response" -ne 200 ]; do
    let counter+=1
    if ((counter % 20 == 0)); then
        echo "Waiting for server to be ready... (Attempt: $((counter+1)))"
        sleep 0.1
    fi
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
    done
}

ping_server & 
cd /home/user && npx next dev --turbopack