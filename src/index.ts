import fetch from 'isomorphic-fetch';

interface MicroCMSResultType<T> {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
}

const convertQuery = (
  query:
    | {
        [key: string]: string | ReadonlyArray<keyof any> | number | boolean | undefined;
      }
    | {}
) =>
  Object.entries(query).reduce(
    (a, [name, value], index) =>
      `${a}${index ? '&' : '?'}${name}=${Array.isArray(value) ? value.join(',') : value}`,
    ''
  );

export class MicroCMS<
  T extends { [key in 'get' | 'post' | 'put' | 'patch']: P },
  P extends { [key in K]: T[keyof T][K] } = T[keyof T],
  K extends keyof T[keyof T] = keyof T[keyof T]
> {
  constructor(
    private options: {
      service: string;
      apiKey?: string;
      apiWriteKey?: string;
      apiGlobalKey?: string;
    }
  ) {}

  async get<E extends K, F extends keyof T['get'][E]>(
    endpoint: E,
    id: string,
    options: {
      draftKey?: string;
      fields?: ReadonlyArray<F>;
      depth?: number;
      globalKey?: boolean;
    } = {}
  ): Promise<Pick<T['get'][E], F> | null> {
    const { globalKey, ...o } = options;
    const queryString = options && convertQuery(o);
    const { service, apiKey, apiGlobalKey } = this.options;
    if (!apiKey) return null;
    return fetch(`https://${service}.microcms.io/api/v1/${endpoint}/${id}${queryString}`, {
      headers:
        globalKey && apiGlobalKey
          ? { 'X-API-KEY': apiKey, 'X-GLOBAL-DRAFT-KEY': apiGlobalKey }
          : { 'X-API-KEY': apiKey },
    })
      .then(async (res) => (res.status === 200 ? res.json() : null))
      .catch(() => null);
  }
  async gets<E extends K, F extends keyof T['get'][E]>(
    endpoint: E,
    options: {
      draftKey?: string;
      limit?: number;
      offset?: number;
      orders?: string;
      q?: string;
      fields?: F[];
      ids?: string;
      filters?: string;
      depth?: number;
      globalKey?: boolean;
    } = {}
  ): Promise<MicroCMSResultType<Pick<T['get'][E], F>> | null> {
    const { globalKey, ...o } = options;
    const queryString = options && convertQuery(o);
    const { service, apiKey, apiGlobalKey } = this.options;
    if (!apiKey) return null;
    return fetch(`https://${service}.microcms.io/api/v1/${endpoint}${queryString}`, {
      headers:
        globalKey && apiGlobalKey
          ? { 'X-API-KEY': apiKey, 'X-GLOBAL-DRAFT-KEY': apiGlobalKey }
          : { 'X-API-KEY': apiKey },
    })
      .then(async (res) => (res.status === 200 ? res.json() : null))
      .catch(() => null);
  }
  async post<E extends K>(
    endpoint: E,
    params: Omit<T['post'][E], 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'revisedAt'> & {
      createdAt?: string;
      updatedAt?: string;
      publishedAt?: string;
      revisedAt?: string;
    }
  ): Promise<string | null> {
    const { service, apiWriteKey } = this.options;
    if (!apiWriteKey) return null;
    return fetch(`https://${service}.microcms.io/api/v1/${endpoint}`, {
      method: 'post',
      headers: { 'X-WRITE-API-KEY': apiWriteKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
      .then(async (res) => (res.status === 201 ? (await res.json())['id'] : null))
      .catch(() => null) as ReturnType<typeof this.post>;
  }
  async put<E extends K>(
    endpoint: E,
    id: string | undefined,
    params: T['put'][E]
  ): Promise<string | null> {
    const { service, apiWriteKey } = this.options;
    if (!apiWriteKey) return null;
    return fetch(`https://${service}.microcms.io/api/v1/${endpoint}/${id}`, {
      method: 'put',
      headers: { 'X-WRITE-API-KEY': apiWriteKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
      .then(async (res) => (res.status === 201 ? (await res.json())['id'] : null))
      .catch((e) => null) as ReturnType<typeof this.put>;
  }
  async patch<E extends K>(endpoint: E, id: string, params: T['patch'][E]): Promise<string | null> {
    const { service, apiWriteKey } = this.options;
    if (!apiWriteKey) return null;
    return fetch(`https://${service}.microcms.io/api/v1/${endpoint}/${id}`, {
      method: 'patch',
      headers: { 'X-WRITE-API-KEY': apiWriteKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
      .then(async (res) => (res.status === 200 ? (await res.json())['id'] : null))
      .catch(() => null) as ReturnType<typeof this.patch>;
  }
  async delete<E extends K>(endpoint: E, id: string): Promise<boolean> {
    const { service, apiWriteKey } = this.options;
    if (!apiWriteKey) return false;
    return fetch(`https://${service}.microcms.io/api/v1/${endpoint}/${id}`, {
      method: 'delete',
      headers: { 'X-WRITE-API-KEY': apiWriteKey, 'Content-Type': 'application/json' },
    })
      .then(async (res) => (res.status === 202 ? true : false))
      .catch(() => false) as ReturnType<typeof this.delete>;
  }

  async get2<E extends K, F extends keyof P[E]>(
    endpoint: E,
    id: string,
    options: {
      draftKey?: string;
      fields?: ReadonlyArray<F>;
      depth?: number;
      globalKey?: boolean;
    } = {}
  ): Promise<
    | {
        code: 200;
        body: P[E];
      }
    | { code: 401; body: { message: string } }
    | null
  > {
    const { globalKey, ...o } = options;
    const queryString = options && convertQuery(o);
    const { service, apiKey, apiGlobalKey } = this.options;
    if (!apiKey) return null;
    return fetch(`https://${service}.microcms.io/api/v1/${endpoint}/${id}${queryString}`, {
      headers:
        globalKey && apiGlobalKey
          ? { 'X-API-KEY': apiKey, 'X-GLOBAL-DRAFT-KEY': apiGlobalKey }
          : { 'X-API-KEY': apiKey },
    })
      .then(async (res) => ({ code: res.status, body: await res.json() }))
      .catch(() => null) as T['get'][K] | null;
  }
  async gets2<E extends K, F extends keyof P[E]>(
    endpoint: E,
    options: {
      draftKey?: string;
      limit?: number;
      offset?: number;
      orders?: string;
      q?: string;
      fields?: ReadonlyArray<F>;
      ids?: string;
      filters?: string;
      depth?: number;
      globalKey?: boolean;
    } = {}
  ) {
    const { globalKey, ...o } = options;
    const queryString = options && convertQuery(o);
    const { service, apiKey, apiGlobalKey } = this.options;
    if (!apiKey) return null;
    return fetch(`https://${service}.microcms.io/api/v1/${endpoint}${queryString}`, {
      headers:
        globalKey && apiGlobalKey
          ? { 'X-API-KEY': apiKey, 'X-GLOBAL-DRAFT-KEY': apiGlobalKey }
          : { 'X-API-KEY': apiKey },
    })
      .then(async (res) => ({ code: res.status, body: await res.json() }))
      .catch(() => null) as Promise<
      | {
          code: 200;
          body: MicroCMSResultType<Pick<T['get'][E], F>>;
        }
      | { code: 401; body: { message: string } }
      | null
    >;
  }
  async post2<E extends K>(
    endpoint: E,
    params: Omit<T['post'][E], 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'revisedAt'> & {
      createdAt?: string;
      updatedAt?: string;
      publishedAt?: string;
      revisedAt?: string;
    }
  ): Promise<
    { code: 400; body: { message: string } } | { code: 201; body: { id: string } } | null
  > {
    const { service, apiWriteKey } = this.options;
    if (!apiWriteKey) return null;
    return fetch(`https://${service}.microcms.io/api/v1/${endpoint}`, {
      method: 'post',
      headers: { 'X-WRITE-API-KEY': apiWriteKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
      .then(async (res) => ({ code: res.status, body: await res.json() }))
      .catch(() => null) as ReturnType<typeof this.post2>;
  }
  async put2<E extends K>(
    endpoint: E,
    id: string | undefined,
    params: T['put'][E]
  ): Promise<
    { code: 400; body: { message: string } } | { code: 201; body: { id: string } } | null
  > {
    const { service, apiWriteKey } = this.options;
    if (!apiWriteKey) return null;
    return fetch(`https://${service}.microcms.io/api/v1/${endpoint}/${id}`, {
      method: 'put',
      headers: { 'X-WRITE-API-KEY': apiWriteKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
      .then(async (res) => ({ code: res.status, body: await res.json() }))
      .catch(() => null) as ReturnType<typeof this.put2>;
  }
  async patch2<E extends K>(
    endpoint: E,
    id: string,
    params: T['patch'][E]
  ): Promise<
    { code: 400; body: { message: string } } | { code: 200; body: { id: string } } | null
  > {
    const { service, apiWriteKey } = this.options;
    if (!apiWriteKey) return null;
    return fetch(`https://${service}.microcms.io/api/v1/${endpoint}/${id}`, {
      method: 'patch',
      headers: { 'X-WRITE-API-KEY': apiWriteKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
      .then(async (res) => ({ code: res.status, body: await res.json() }))
      .catch(() => null) as ReturnType<typeof this.patch2>;
  }
  async delete2<E extends K>(
    endpoint: E,
    id: string
  ): Promise<
    { code: 400; body: { message: string } } | { code: 202; body: { id: string } } | null
  > {
    const { service, apiWriteKey } = this.options;
    if (!apiWriteKey) return null;
    return fetch(`https://${service}.microcms.io/api/v1/${endpoint}/${id}`, {
      method: 'delete',
      headers: { 'X-WRITE-API-KEY': apiWriteKey, 'Content-Type': 'application/json' },
    })
      .then(async (res) => ({ code: res.status, body: true }))
      .catch(() => null) as ReturnType<typeof this.delete2>;
  }
}
