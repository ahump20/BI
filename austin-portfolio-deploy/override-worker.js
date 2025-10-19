export default {
  async fetch(request, env) {
    // Redirect to the working Pages deployment
    return Response.redirect('https://c0284e22.blazesportsintel.pages.dev' + new URL(request.url).pathname, 301);
  },
};