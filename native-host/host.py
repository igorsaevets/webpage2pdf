#!/usr/bin/env python3
import sys, json, struct, base64, os, pathlib

def read_msg():
    raw_len = sys.stdin.buffer.read(4)
    if not raw_len or len(raw_len) < 4: return None
    msg_len = struct.unpack('<I', raw_len)[0]
    data = sys.stdin.buffer.read(msg_len)
    return json.loads(data.decode('utf-8'))

def write_msg(obj):
    data = json.dumps(obj).encode('utf-8')
    sys.stdout.buffer.write(struct.pack('<I', len(data)))
    sys.stdout.buffer.write(data)
    sys.stdout.buffer.flush()

def main():
    while True:
        msg = read_msg()
        if msg is None: break
        try:
            action = msg.get('action')
            if action == 'save':
                dir_path = msg.get('dir','')
                filename = msg.get('filename','output.pdf')
                b64 = msg.get('data','')
                # sanitize filename only (no dir traversal)
                filename = os.path.basename(filename)
                if not filename: filename = 'output.pdf'
                # ensure dir exists (absolute expected)
                p = pathlib.Path(dir_path) / filename
                p.parent.mkdir(parents=True, exist_ok=True)
                data = base64.b64decode(b64)
                p.write_bytes(data)
                write_msg({ 'ok': True, 'path': str(p) })
            elif action == 'ping':
                write_msg({ 'ok': True, 'pong': True })
            else:
                write_msg({ 'ok': False, 'error': f'unknown action {action}' })
        except Exception as e:
            try: write_msg({ 'ok': False, 'error': str(e) })
            except: pass

if __name__ == '__main__':
    main()
