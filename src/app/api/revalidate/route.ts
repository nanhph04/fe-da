import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface RevalidatePayload {
  secret?: string;
  tag?: string;
  path?: string;
}

function getSecretFromRequest(
  request: NextRequest,
  payload?: RevalidatePayload
) {
  return (
    payload?.secret ||
    request.nextUrl.searchParams.get("secret") ||
    request.headers.get("x-revalidate-secret") ||
    undefined
  );
}

async function handleRevalidate(
  request: NextRequest,
  payload?: RevalidatePayload
) {
  const configuredSecret = process.env.NEXT_REVALIDATE_SECRET;

  if (!configuredSecret) {
    return NextResponse.json(
      {
        revalidated: false,
        message: "NEXT_REVALIDATE_SECRET is not configured",
      },
      { status: 500 }
    );
  }

  const secret = getSecretFromRequest(request, payload);
  if (secret !== configuredSecret) {
    return NextResponse.json(
      {
        revalidated: false,
        message: "Invalid revalidation secret",
      },
      { status: 401 }
    );
  }

  const tag = payload?.tag || request.nextUrl.searchParams.get("tag");
  const path = payload?.path || request.nextUrl.searchParams.get("path");

  if (!tag && !path) {
    return NextResponse.json(
      {
        revalidated: false,
        message: "Provide either tag or path",
      },
      { status: 400 }
    );
  }

  if (tag) {
    revalidateTag(tag, "max");
  }

  if (path) {
    revalidatePath(path);
  }

  return NextResponse.json({
    revalidated: true,
    now: Date.now(),
    tag,
    path,
  });
}

export async function GET(request: NextRequest) {
  return handleRevalidate(request);
}

export async function POST(request: NextRequest) {
  let payload: RevalidatePayload | undefined;

  try {
    payload = (await request.json()) as RevalidatePayload;
  } catch {
    payload = undefined;
  }

  return handleRevalidate(request, payload);
}
