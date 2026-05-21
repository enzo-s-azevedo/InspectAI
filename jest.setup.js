import '@testing-library/jest-dom';

// 1. Mock do Headers (O Next.js exige o método getSetCookie para ler os cookies)
if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this.map = init instanceof Headers ? new Map(init.map) : new Map(Object.entries(init));
    }
    get(name) { return this.map.get(name) || null; }
    set(name, value) { this.map.set(name, value); }
    has(name) { return this.map.has(name); }
    delete(name) { this.map.delete(name); }
    forEach(callback) { this.map.forEach(callback); }
    getSetCookie() { return []; } // <-- Resolve o erro: Cannot read properties of undefined (reading 'getSetCookie')
  };
}

// 2. Mock do Request (Mantém a solução do getter bloqueado da URL)
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init) {
      Object.defineProperty(this, 'url', { value: input, writable: true });
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers || {});
    }
  };
}

// 3. Mock do Response (O Next.js exige o método estático 'json' e a propriedade 'headers')
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.headers = new Headers(init.headers); // <-- Garante que headers nunca seja undefined
    }
    static json(data, init = {}) { // <-- Resolve o erro: Response.json is not a function
      return new Response(JSON.stringify(data), init);
    }
  };
}