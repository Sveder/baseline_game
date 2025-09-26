# Django Hello World with Nginx and Gunicorn Setup

## What's been created:
1. Django project "helloworld" with a simple "Hello, World!" app
2. Gunicorn configuration file (`gunicorn_config.py`)
3. Gunicorn start script (`start_gunicorn.sh`)
4. Nginx configuration (`nginx_helloworld.conf`)

## To complete the setup (requires sudo privileges):

### Install Nginx:
```bash
sudo apt update
sudo apt install nginx
```

### Copy Nginx configuration:
```bash
sudo cp /home/sveder/baseline_game/nginx_helloworld.conf /etc/nginx/sites-available/helloworld
sudo ln -s /etc/nginx/sites-available/helloworld /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
```

### Start services:
```bash
# Start Gunicorn
/home/sveder/baseline_game/start_gunicorn.sh &

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Access your application:
- Visit http://localhost in your browser
- You should see "Hello, World!"

## Files structure:
```
/home/sveder/baseline_game/
├── venv/                    # Python virtual environment
├── helloworld/              # Django project
│   ├── manage.py
│   ├── hello/              # Django app
│   └── helloworld/         # Project settings
├── gunicorn_config.py      # Gunicorn configuration
├── start_gunicorn.sh       # Gunicorn startup script
└── nginx_helloworld.conf   # Nginx configuration
```