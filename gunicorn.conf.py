import multiprocessing

# Server socket
bind = "0.0.0.0:443"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 50
preload_app = True

# Restart workers after this many seconds
max_worker_memory = 500  # MB
worker_tmp_dir = "/dev/shm"

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = "baseline_game"

# Server mechanics
daemon = False
pidfile = None
tmp_upload_dir = None

# SSL
keyfile = "/etc/letsencrypt/live/baseline.sveder.com/privkey.pem"
certfile = "/etc/letsencrypt/live/baseline.sveder.com/fullchain.pem"