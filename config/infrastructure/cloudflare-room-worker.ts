export class Room {
  state: DurableObjectState;
  env: Env;
  sessions: Set<WebSocket>;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.sessions = new Set();
  }

  async fetch(request: Request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected websocket", { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    await this.handleSession(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  async handleSession(ws: WebSocket) {
    ws.accept();
    this.sessions.add(ws);

    ws.addEventListener("message", async (event) => {
      if (typeof event.data !== "string") return;

      let payload: { type?: string } | undefined;
      try {
        payload = JSON.parse(event.data);
      } catch (error) {
        console.error("room:invalid-payload", error);
        return;
      }

      if (payload.type === "heartbeat") {
        ws.send(JSON.stringify({ type: "heartbeat", ts: Date.now() }));
        return;
      }

      // Broadcast to active sessions
      for (const peer of this.sessions) {
        if (peer !== ws && peer.readyState === WebSocket.OPEN) {
          peer.send(event.data);
        }
      }

      // Ship structured events for downstream analytics
      await this.env.EVENTS.send({ body: event.data });
    });

    const close = () => {
      this.sessions.delete(ws);
    };

    ws.addEventListener("close", close);
    ws.addEventListener("error", close);
  }
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/rt/ws")) {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      const room = env.ROOM.get(env.ROOM.idFromName("pressure-terminal"));
      await room.fetch(request, { webSocket: server });
      return new Response(null, { status: 101, webSocket: client });
    }

    if (url.pathname.startsWith("/api/v1")) {
      const upstream = new URL(env.MCP_ENDPOINT + url.pathname + url.search);
      const res = await fetch(upstream.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method === "GET" ? undefined : await request.text(),
      });

      return new Response(res.body, {
        status: res.status,
        headers: res.headers,
      });
    }

    return new Response("Not found", { status: 404 });
  },
};

type Env = {
  ROOM: DurableObjectNamespace;
  MCP_ENDPOINT: string;
  EVENTS: Queue;
};

interface Queue {
  send(message: { body: string }): Promise<void>;
}
