const DEFAULT_HEADERS = {
  'User-Agent': 'BlazeIntelligenceTexasHS/1.0 (+https://blaze-intelligence.netlify.app)',
  'Accept': 'text/html,application/json;q=0.9,*/*;q=0.8'
};

export default class BaseAdapter {
  constructor({
    name,
    baseUrl = '',
    defaultHeaders = {},
    timeout = 12000,
    minRequestInterval = 500
  } = {}) {
    this.name = name || 'unknown-adapter';
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.timeout = timeout;
    this.defaultHeaders = { ...DEFAULT_HEADERS, ...defaultHeaders };
    this.minRequestInterval = minRequestInterval;
    this.lastRequestTime = 0;
  }

  async fetch(url, {
    headers = {},
    method = 'GET',
    searchParams,
    timeout = this.timeout,
    signal,
    body
  } = {}) {
    const target = this.buildUrl(url, searchParams);
    await this.respectRateLimit();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(target, {
        method,
        headers: { ...this.defaultHeaders, ...headers },
        body,
        signal: signal || controller.signal,
        redirect: 'follow'
      });

      if (!response.ok) {
        const snippet = await response.text().catch(() => '');
        throw new Error(
          `[${this.name}] Request failed (${response.status}) ${response.statusText} - ${snippet.slice(0, 200)}`
        );
      }

      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`[${this.name}] Request to ${target} timed out after ${timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  async fetchJson(url, options) {
    const response = await this.fetch(url, options);
    return response.json();
  }

  async fetchHtml(url, options) {
    const response = await this.fetch(url, options);
    return response.text();
  }

  buildUrl(url, searchParams) {
    let target = url;
    if (!/^https?:\/\//i.test(url)) {
      if (!this.baseUrl) {
        throw new Error(`[${this.name}] Unable to resolve relative URL: ${url}`);
      }
      target = `${this.baseUrl}/${url.replace(/^\//, '')}`;
    }

    if (searchParams && Object.keys(searchParams).length) {
      const parsed = new URL(target);
      for (const [key, value] of Object.entries(searchParams)) {
        if (value === undefined || value === null || value === '') continue;
        parsed.searchParams.set(key, value);
      }
      target = parsed.toString();
    }

    return target;
  }

  async respectRateLimit() {
    const now = Date.now();
    const waitTime = this.minRequestInterval - (now - this.lastRequestTime);
    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  extractJsonLd(html) {
    const matches = [...html.matchAll(/<script[^>]*type=['"]application\/ld\+json['"][^>]*>([\s\S]*?)<\/script>/gi)];
    const documents = [];
    for (const [, script] of matches) {
      const content = script.trim();
      if (!content) continue;
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          documents.push(...parsed);
        } else {
          documents.push(parsed);
        }
      } catch (error) {
        // Ignore malformed JSON-LD blocks
      }
    }
    return documents;
  }

  extractScriptJson(html, selectors = []) {
    const targets = Array.isArray(selectors) ? selectors : [selectors];

    for (const selector of targets) {
      if (!selector) continue;

      if (typeof selector === 'string') {
        const idRegex = new RegExp(`<script[^>]*id=['"]${selector}['"][^>]*>([\s\S]*?)<\/script>`, 'i');
        const idMatch = html.match(idRegex);
        if (idMatch && idMatch[1]) {
          const parsed = this.safeJsonParse(idMatch[1]);
          if (parsed) return parsed;
        }

        const varRegex = new RegExp(`${selector}\s*=\s*({[\s\S]*?});`, 'i');
        const varMatch = html.match(varRegex);
        if (varMatch && varMatch[1]) {
          const parsed = this.safeJsonParse(varMatch[1]);
          if (parsed) return parsed;
        }
      } else if (selector.id) {
        const idRegex = new RegExp(`<script[^>]*id=['"]${selector.id}['"][^>]*>([\s\S]*?)<\/script>`, selector.flags || 'i');
        const idMatch = html.match(idRegex);
        if (idMatch && idMatch[1]) {
          const parsed = this.safeJsonParse(idMatch[1]);
          if (parsed) return parsed;
        }
      } else if (selector.pattern) {
        const pattern = new RegExp(selector.pattern, selector.flags || 'i');
        const match = html.match(pattern);
        if (match && match[1]) {
          const parsed = this.safeJsonParse(match[1]);
          if (parsed) return parsed;
        }
      }
    }

    return null;
  }

  safeJsonParse(value) {
    try {
      if (typeof value !== 'string') {
        return value;
      }
      const trimmed = value.trim();
      if (!trimmed) return null;

      // Remove trailing semicolons or HTML comments
      const sanitized = trimmed
        .replace(/^[\s;]*/, '')
        .replace(/[\s;]*$/, '')
        .replace(/<\/?script>/gi, '')
        .replace(/<!--([\s\S]*?)-->/g, '$1');

      return JSON.parse(sanitized);
    } catch (error) {
      return null;
    }
  }

  parseNumber(value) {
    if (value === undefined || value === null) return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const sanitized = String(value).replace(/[^0-9.\-]/g, '');
    if (!sanitized) return null;
    const parsed = parseFloat(sanitized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  normalizeText(value) {
    if (!value) return null;
    return String(value).replace(/\s+/g, ' ').trim();
  }

  toDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  }
}
