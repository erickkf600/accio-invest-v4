import asyncio
import hashlib
import functools
import json
import threading
import time

def cache_memory(maxsize=100, ttl_seconds=300):
    cache = {}
    lock = threading.Lock()

    def decorator(func):

        def make_cache_key(args, kwargs):
            def make_hashable(obj):
                if isinstance(obj, list):
                    return tuple(make_hashable(item) for item in obj)
                if isinstance(obj, dict):
                    return tuple(sorted((k, make_hashable(v)) for k, v in obj.items()))
                return obj

            hashable_args = tuple(make_hashable(arg) for arg in args)
            hashable_kwargs = tuple((k, make_hashable(v)) for k, v in sorted(kwargs.items()))

            key_str = json.dumps((hashable_args, hashable_kwargs), sort_keys=True, default=str)
            return hashlib.md5(key_str.encode()).hexdigest()

        def get_from_cache(cache_key, now):
            with lock:
                if cache_key in cache:
                    entry = cache[cache_key]
                    if now - entry['time'] < ttl_seconds:
                        return entry['value']
            return None

        def store_in_cache(cache_key, value, now):
            with lock:
                if len(cache) >= maxsize:
                    oldest_key = min(cache, key=lambda k: cache[k]['time'])
                    cache.pop(oldest_key)
                cache[cache_key] = {'value': value, 'time': now}

        if asyncio.iscoroutinefunction(func):
            @functools.wraps(func)
            async def async_wrapper(*args, **kwargs):
                cache_key = make_cache_key(args, kwargs)
                now = time.time()

                cached = get_from_cache(cache_key, now)
                if cached is not None:
                    return cached

                result = await func(*args, **kwargs)

                store_in_cache(cache_key, result, now)
                return result
            return async_wrapper
        else:
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                cache_key = make_cache_key(args, kwargs)
                now = time.time()

                cached = get_from_cache(cache_key, now)
                if cached is not None:
                    return cached

                result = func(*args, **kwargs)

                store_in_cache(cache_key, result, now)
                return result
            return wrapper

    return decorator
