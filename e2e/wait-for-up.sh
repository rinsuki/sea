#!/bin/bash
until curl --fail http://localhost:3000 > /dev/null; do
    sleep 1
done