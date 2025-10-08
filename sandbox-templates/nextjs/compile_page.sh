#!/bin/bash

function ping_server(){
    counter=0
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
    while [[ ${response} -ne 200 ]]; do
        let counter++ 
        if ((counter % 20 == 0)); then
                echo "Waiting for server to be ready..."
                sleep 0.1
            fi
    
        response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
    done
    echo "Server is ready!"
    echo "${response}"
}

ping_server & 
cd /home/user && npx next dev --turbopack