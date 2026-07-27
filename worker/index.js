export default {
  async fetch(request, env) {
    if (!env?.ASSETS?.fetch) {
      return new Response("Visual SpotyMusic: arquivos estáticos indisponíveis.", { status: 503 });
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const url = new URL(request.url);
    if (!url.pathname.includes(".")) {
      const htmlUrl = new URL(request.url);
      htmlUrl.pathname = `${url.pathname.replace(/\/$/, "") || "/index"}.html`;
      const htmlResponse = await env.ASSETS.fetch(new Request(htmlUrl, request));
      if (htmlResponse.status !== 404) return htmlResponse;
    }

    return response;
  },
};
