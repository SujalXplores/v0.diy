import { proxyPreviewRequest } from "@/server/preview/proxy-preview";

type Context = RouteContext<"/preview/[token]/[[...path]]">;

async function handler(request: Request, { params }: Context) {
  const { token, path = [] } = await params;
  return proxyPreviewRequest(request, token, path);
}

export {
  handler as DELETE,
  handler as GET,
  handler as HEAD,
  handler as OPTIONS,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
