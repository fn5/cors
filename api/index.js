import express from 'express';
import cors from 'cors';
import request from 'request';

function parseProxyParameters(proxyRequest) {
  const params = {};
  // Check if there is an URL directly in the path
  const urlMatch = proxyRequest.url.match(/^\/(https?:\/\/.+)/);
  if (urlMatch) {
    params.url = decodeURIComponent(urlMatch[1]);
  } else {
    // If not in the path, check for the url query parameter
    const queryMatch = proxyRequest.url.match(/(?<=[?&])url=(?<url>.*)$/);
    if (queryMatch) {
      params.url = decodeURIComponent(queryMatch.groups.url);
    }
  }

  return params;
}

const app = express();
app.use(cors());
app.set('json spaces', 2);

app.all('/*', async (req, res) => {
  try {
    const proxyParams = parseProxyParameters(req);
    if (!proxyParams.url) {
      return res.status(400).json({
        title: 'CORS Proxy Error - Required parameter is missing',
        detail: 'The parameter: url was not provided',
      });
    }

    // Proxy request to the target URL
    const target = request(proxyParams.url);
    req.pipe(target);
    target.pipe(res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      title: 'CORS Proxy Error - Internal server error',
      detail: err.message,
    });
  }
});

export default app;
