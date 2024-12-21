import express from 'express';
import cors from 'cors';
import request from 'request';

function parseProxyParameters(proxyRequest) {
  const params = {};
  // url - treat everything right to url= query parameter as target url value
  const urlMatch = proxyRequest.url.match(/(?<=[?&])url=(?<url>.*)$/);
  if (urlMatch) {
    params.url = decodeURIComponent(urlMatch.groups.url);
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
        "title": "CORS Proxy Error - Parametri richiesti mancanti",
        "detail": "Il parametro: url non è stato specificato",
      });
    }

    // Add the custom header to the request options
    const requestOptions = {
      url: proxyParams.url,
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    };

    // proxy request to target url with custom headers
    const target = request(requestOptions);
    req.pipe(target);
    target.pipe(res);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      "title": "CORS Proxy Error - Internal server error 500",
      "detail": err.message,
    });
  }
});

export default app;
