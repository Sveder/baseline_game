#!/bin/bash
cd /home/sveder/baseline_game/helloworld
source /home/sveder/baseline_game/venv/bin/activate
exec gunicorn --config /home/sveder/baseline_game/gunicorn_config.py helloworld.wsgi:application