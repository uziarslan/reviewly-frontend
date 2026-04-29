/**
 * Netlify Function: share
 *
 * Intercepts /share/:token requests and serves the React app's index.html
 * with dynamic Open Graph meta tags injected (Cloudinary image URL when
 * available, falling back to /og-share.png).
 *
 * All other pages continue to use the static /og-default.jpg set in index.html.
 */

const esc = (s) =>
    String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

exports.handler = async (event) => {
    // Extract token from the original path (e.g. /share/abc123...)
    const parts = (event.path || '').split('/').filter(Boolean);
    const shareToken = parts[parts.length - 1] || '';

    const siteUrl = (process.env.REACT_APP_SITE_URL || 'https://reviewly.ph').replace(/\/$/, '');
    const apiBase = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

    // Validate token — must be a 32-char hex string
    if (!shareToken || !/^[0-9a-f]{32}$/.test(shareToken)) {
        return { statusCode: 302, headers: { Location: siteUrl } };
    }

    let ogTitle = 'My Mock Exam Score – Reviewly';
    let ogDesc = 'Take a realistic Civil Service mock exam and see how close you are to passing.';
    let ogImage = `${siteUrl}/og-share.png`; // default for share pages
    const pageUrl = `${siteUrl}/share/${shareToken}`;

    // ── Fetch attempt data from the API ──────────────────────────────────────
    try {
        const apiRes = await fetch(`${apiBase}/exams/shared/${shareToken}`, {
            headers: { Accept: 'application/json', 'User-Agent': 'Reviewly-OG/1.0' },
        });

        if (apiRes.ok) {
            const json = await apiRes.json();
            if (json.success && json.data) {
                const { reviewer, result, shareImageUrl } = json.data;
                const examTitle = reviewer?.title || 'Mock Exam';
                const pct =
                    result?.percentage != null ? Number(result.percentage).toFixed(0) : null;
                const passed = result?.passed;

                if (pct !== null) {
                    ogTitle = `${pct}% on ${examTitle} – Reviewly`;
                    ogDesc = passed
                        ? `✅ I passed the ${examTitle} with ${pct}% on Reviewly!`
                        : `✅ I scored ${pct}% on the ${examTitle}. See the full breakdown on Reviewly.`;
                }

                // Use Cloudinary URL if available, otherwise keep og-share.png
                if (shareImageUrl) {
                    ogImage = shareImageUrl;
                }
            }
        }
    } catch (_) {
        // API unavailable — continue with defaults
    }

    // ── Build the OG meta block ───────────────────────────────────────────────
    const ogBlock = [
        `<meta property="og:type" content="website" />`,
        `<meta property="og:url" content="${esc(pageUrl)}" />`,
        `<meta property="og:title" content="${esc(ogTitle)}" />`,
        `<meta property="og:description" content="${esc(ogDesc)}" />`,
        `<meta property="og:image" content="${esc(ogImage)}" />`,
        `<meta property="og:site_name" content="Reviewly" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${esc(ogTitle)}" />`,
        `<meta name="twitter:description" content="${esc(ogDesc)}" />`,
        `<meta name="twitter:image" content="${esc(ogImage)}" />`,
    ].join('\n    ');

    // ── Fetch index.html and inject OG tags ───────────────────────────────────
    // Use DEPLOY_URL (Netlify's unique deploy URL) to bypass any custom-domain
    // access-control that might block an HTTP request to the custom domain itself.
    const fetchBase = (process.env.DEPLOY_URL || process.env.URL || siteUrl).replace(/\/$/, '');

    try {
        const htmlRes = await fetch(`${fetchBase}/index.html`, {
            headers: { 'User-Agent': 'Reviewly-OG/1.0', Accept: 'text/html' },
        });

        if (htmlRes.ok) {
            let html = await htmlRes.text();

            // Strip existing og: / twitter: tags, then prepend fresh dynamic ones
            html = html
                .replace(/<meta[^>]+property="og:[^"]*"[^>]*>/g, '')
                .replace(/<meta[^>]+name="twitter:[^"]*"[^>]*>/g, '')
                .replace('<head>', `<head>\n    ${ogBlock}`);

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'text/html; charset=UTF-8',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                },
                body: html,
            };
        }
    } catch (_) {
        // Fall through to minimal fallback
    }

    // ── Minimal fallback (index.html unavailable) ─────────────────────────────
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html; charset=UTF-8' },
        body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${esc(ogTitle)}</title>
  ${ogBlock}
</head>
<body>
  <p><a href="${esc(siteUrl)}">View on Reviewly</a></p>
</body>
</html>`,
    };
};
