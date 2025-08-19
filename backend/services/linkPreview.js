const { URL } = require('url');

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000, headers = {} } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const res = await fetch(resource, {
            ...options,
            headers: {
                'user-agent': 'Mozilla/5.0 (compatible; AVMasterBot/1.0; +https://worldcastlive.com)'
                , ...headers
            },
            signal: controller.signal
        });
        return res;
    } finally {
        clearTimeout(id);
    }
}

function resolveUrlMaybe(base, maybeRelative) {
    try {
        return new URL(maybeRelative, base).href;
    } catch {
        return null;
    }
}

function extractMeta(content, baseUrl) {
    const result = {};

    // Helper regex matchers
    const m = (re) => {
        const match = content.match(re);
        return match ? match[1].trim() : null;
    };

    // Open Graph first
    result.title = m(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i)
        || m(/<title[^>]*>([^<]+)<\/title>/i);

    result.description = m(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i)
        || m(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i);

    const ogImage = m(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i)
        || m(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    result.image = ogImage ? resolveUrlMaybe(baseUrl, ogImage) : null;

    const iconHref = m(/<link[^>]+rel=["'](?:shortcut icon|icon)["'][^>]+href=["']([^"']+)["'][^>]*>/i);
    result.favicon = iconHref ? resolveUrlMaybe(baseUrl, iconHref) : null;

    return result;
}

function getDomainFromUrl(targetUrl) {
    try {
        return new URL(targetUrl).hostname.replace(/^www\./, '');
    } catch {
        return 'unknown';
    }
}

async function getLinkPreview(targetUrl) {
    const domain = getDomainFromUrl(targetUrl);
    const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    try {
        const res = await fetchWithTimeout(targetUrl, { timeout: 7000 });
        const contentType = res.headers.get('content-type') || '';

        if (!contentType.includes('text/html')) {
            // Not HTML – return minimal preview
            return {
                url: targetUrl,
                domain,
                title: domain,
                description: '',
                image: null,
                favicon: fallbackFavicon
            };
        }

        // Limit body size to avoid huge downloads
        const buffer = await res.arrayBuffer();
        const MAX_BYTES = 350_000; // ~350KB
        const slice = buffer.byteLength > MAX_BYTES ? buffer.slice(0, MAX_BYTES) : buffer;
        const html = new TextDecoder('utf-8').decode(slice);

        const meta = extractMeta(html, targetUrl);

        return {
            url: targetUrl,
            domain,
            title: meta.title || domain,
            description: meta.description || '',
            image: meta.image || null,
            favicon: meta.favicon || fallbackFavicon
        };
    } catch (err) {
        return {
            url: targetUrl,
            domain,
            title: domain,
            description: '',
            image: null,
            favicon: fallbackFavicon
        };
    }
}

module.exports = { getLinkPreview };


