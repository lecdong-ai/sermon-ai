import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isValidUrl = supabaseUrl.startsWith('http') && !supabaseUrl.includes('YOUR_PROJECT');

const createDummyClient = () => {
  const _dummyError = new Error('Supabase URL이 유효하지 않습니다.');

  const buildProxy = () => {
    const fn = (...args: any[]) => {
      if (args.length === 1 && typeof args[0] === 'function') {
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
      return Promise.resolve({ data: null, error: _dummyError });
    };
    return new Proxy(fn, {
      get(_target, prop) {
        if (prop === 'then' || prop === 'catch') return undefined;
        if (prop === 'subscription') return { unsubscribe: () => {} };
        return buildProxy();
      },
      apply(_target, _thisArg, args) {
        return fn(...args);
      },
    });
  };

  return buildProxy();
};

export const supabaseAdmin = (isValidUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : createDummyClient()) as unknown as SupabaseClient;

export function toUUID(id: string): string {
  if (id.startsWith('r') && !isNaN(Number(id.slice(1)))) {
    const num = id.slice(1).padStart(12, '0');
    return `11111111-1111-1111-1111-${num}`;
  }
  return id;
}

export function fromUUID(uuid: string): string {
  if (uuid && uuid.startsWith('11111111-1111-1111-1111-')) {
    const numStr = uuid.split('-').pop() || '';
    const num = parseInt(numStr, 10);
    return `r${num}`;
  }
  return uuid;
}
