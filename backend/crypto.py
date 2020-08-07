import hashlib

def doEncode(message):
    return "md5" + hashlib.md5(message.encode("utf-8")).hexdigest()