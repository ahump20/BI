(() => {
  if (typeof window === 'undefined') {
    return;
  }

  const listeners = new Map();
  const state = { status: 'idle', lastSync: null };

  const notify = (event, payload) => {
    const handlers = listeners.get(event) || [];
    handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        console.error('Blaze API listener error', error);
      }
    });
  };

  const api = {
    sync() {
      state.status = 'syncing';
      const payload = window.BLAZE_DEMO_DATA || null;

      setTimeout(() => {
        state.status = 'online';
        state.lastSync = new Date().toISOString();
        notify('sync', {
          timestamp: state.lastSync,
          data: payload
        });
      }, 250);
    },
    getState() {
      return { ...state };
    },
    on(event, handler) {
      const existing = listeners.get(event) || [];
      existing.push(handler);
      listeners.set(event, existing);
      return () => {
        const updated = (listeners.get(event) || []).filter((fn) => fn !== handler);
        listeners.set(event, updated);
      };
    },
    emit(event, payload) {
      notify(event, payload);
    }
  };

  if (!window.BlazeAPI) {
    window.BlazeAPI = api;
    window.dispatchEvent(new CustomEvent('blaze:api-ready', { detail: api }));
    console.info('🔌 Blaze API integration ready');
  }

  api.sync();
})();
