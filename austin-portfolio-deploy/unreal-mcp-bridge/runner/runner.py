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
    # Placeholder: in production, speak the MCP protocol to unreal_mcp_server.py.
    # For now we simulate deterministic actions and produce a temp mp4 (or png) using a placeholder.
    # Replace this with a client that uses the fastmcp tools in the repo to drive Unreal.
    return {"ok": True, "details": "Simulated MCP actions executed."}

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