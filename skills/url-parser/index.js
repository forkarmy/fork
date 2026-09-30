// URL parser based on websanova/js-url (MIT licensed)
// https://github.com/websanova/js-url

export default async function run(input) {
  const url = input.url;
  
  if (!url || typeof url !== 'string') {
    return { error: 'Invalid input: url must be a non-empty string' };
  }

  const result = {};
  let workingUrl = url;

  // Handle mailto protocol specially
  const mailtoMatch = workingUrl.match(/^mailto:([^\/].+)/);
  if (mailtoMatch) {
    result.protocol = 'mailto';
    result.email = mailtoMatch[1];
    return result;
  }

  // Remove hashbangs (#!)
  const hashbangMatch = workingUrl.match(/(.*?)\/#\!(.*)/);
  if (hashbangMatch) {
    workingUrl = hashbangMatch[1] + hashbangMatch[2];
  }

  // Extract hash
  const hashMatch = workingUrl.match(/(.*?)#(.*)/);
  if (hashMatch) {
    result.hash = hashMatch[2];
    workingUrl = hashMatch[1];
  }

  // Extract query string
  const queryMatch = workingUrl.match(/(.*?)\?(.*)/);
  if (queryMatch) {
    result.query = queryMatch[2];
    workingUrl = queryMatch[1];
  }

  // Extract protocol
  const protocolMatch = workingUrl.match(/(.*?)\:?\/\/(.*)/);
  if (protocolMatch) {
    result.protocol = protocolMatch[1].toLowerCase();
    workingUrl = protocolMatch[2];
  }

  // Extract path
  const pathMatch = workingUrl.match(/(.*?)(\/.*)/);
  if (pathMatch) {
    result.path = pathMatch[2];
    workingUrl = pathMatch[1];
  }

  // Clean up path
  if (!result.path) {
    result.path = '';
  }
  result.path = result.path.replace(/^([^\/])/, '/$1');

  // Extract file info from path
  if (result.path) {
    const pathParts = result.path.substring(1).split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    if (lastPart && lastPart.match(/\./)) {
      const fileMatch = lastPart.match(/(.*?)\.([^.]+)$/);
      if (fileMatch) {
        result.file = fileMatch[0];
        result.filename = fileMatch[1];
        result.fileext = fileMatch[2];
      }
    }
  }

  // Extract port
  const portMatch = workingUrl.match(/(.*)\:([0-9]+)$/);
  if (portMatch) {
    result.port = portMatch[2];
    workingUrl = portMatch[1];
  }

  // Extract auth
  const authMatch = workingUrl.match(/(.*?)@(.*)/);
  if (authMatch) {
    result.auth = authMatch[1];
    workingUrl = authMatch[2];
  }

  // Extract user and pass
  if (result.auth) {
    const userPassMatch = result.auth.match(/(.*)\:(.*)/);
    if (userPassMatch) {
      result.user = userPassMatch[1];
      result.pass = userPassMatch[2];
    } else {
      result.user = result.auth;
    }
  }

  // Hostname
  result.hostname = workingUrl.toLowerCase();

  // Set port and protocol defaults if not set
  if (!result.port) {
    result.port = result.protocol === 'https' ? '443' : '80';
  }
  if (!result.protocol) {
    result.protocol = result.port === '443' ? 'https' : 'http';
  }

  // Parse query parameters
  if (result.query) {
    result.queryParams = parseParams(result.query);
  }

  // Parse hash parameters
  if (result.hash) {
    result.hashParams = parseParams(result.hash);
  }

  return result;
}

function parseParams(paramString) {
  const params = {};
  const parts = paramString.split('&');

  for (let i = 0; i < parts.length; i++) {
    const field = parts[i].match(/(.*?)=(.*)/);
    let key, value;

    if (!field) {
      key = parts[i];
      value = '';
    } else {
      key = field[1];
      value = decodeURIComponent(field[2].replace(/\+/g, ' '));
    }

    if (key.replace(/\s/g, '') !== '') {
      // Check for array pattern like field[0]
      const arrayMatch = key.match(/(.*)\[([0-9]+)\]/);

      if (arrayMatch) {
        const arrayName = arrayMatch[1];
        const index = parseInt(arrayMatch[2], 10);
        
        if (!params[arrayName]) {
          params[arrayName] = [];
        }
        params[arrayName][index] = value;
      } else {
        params[key] = value;
      }
    }
  }

  return params;
}
