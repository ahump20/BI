const encoder = new TextEncoder();

export default async () => {
  let interval: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode("retry: 5000\n\n"));
      interval = setInterval(() => {
        controller.enqueue(encoder.encode(`data: {"status":"ok","ts":${Date.now()}}\n\n`));
      }, 1000);
    },
    cancel() {
      if (interval) clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};

export const config = {
  path: "/coach/preview",
};
