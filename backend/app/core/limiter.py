from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, enabled=True)

# Add this to skip OPTIONS
import functools
from fastapi import Request
