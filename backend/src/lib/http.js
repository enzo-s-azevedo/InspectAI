import { NextResponse } from 'next/server';

export function ok(data, meta = {}, init = {}) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
      error: null,
    },
    { status: init.status || 200, headers: init.headers }
  );
}

export function fail(message, status = 500, code = 'INTERNAL_ERROR', details = null) {
  return NextResponse.json(
    {
      success: false,
      data: null,
      meta: {},
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function parseQuery(request) {
  return new URL(request.url).searchParams;
}
