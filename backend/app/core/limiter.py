from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request


def get_user_id_or_ip(request: Request) -> str:
    """
    Rate limit key function that uses the Auth0 user ID (x-user-id header)
    instead of IP address, so limits are correctly scoped per registered user.
    Falls back to remote IP for unauthenticated requests.
    """
    user_id = request.headers.get("x-user-id") or request.headers.get("X-User-Id")
    if user_id:
        return user_id
    # Fallback to IP (e.g. load balancer / unauthenticated)
    return get_remote_address(request)


limiter = Limiter(key_func=get_user_id_or_ip, enabled=True)
