/* *************************
BASELINE SECURITY HEADERS - FALLBACK
This plugin provides a conservative CSP baseline that applies when middleware doesn't run
This makes Prod resilient even when middleware is skipped or the CDN serves a cached page. The middleware in security.ts provides
the authoritative Sitecore-managed CSP and will override this when it executes.
************************* */

/**
 * Builds a baseline Content-Security-Policy from environment variable
 * This is a conservative fallback - middleware provides the full Sitecore-managed policy
 */
const buildBaselineCSP = () => {
  // Hardcoded domains for CSP directives
  const connectSrcDomains = `'self' *.google-analytics.com *.visualwebsiteoptimizer.com app.vwo.com *.doubleclick.net *.addthis.com *.addthisedge.com *.contently.com cdn.cookielaw.org *.facebook.net *.onetrust.com *.google.com *.mktoresp.com *.zi-scripts.com *.zoominfo.com *.g.doubleclick.net adservice.google.com *.googletagmanager.com *.analytics.google.com *.bing.com *.cookielaw.org *.raygun.io app.vwo.com *.facebook.com *.sharethis.com *.vidyard.com cdn.linkedin.oribi.io *.clarity.ms px.ads.linkedin.com *.vwo.com *.visualwebsiteoptimizer.com *.globalpayments.com *.omappapi.com t.clarity.ms *.googleadservices.com insight.adsrvr.org *.reddit.com *.redditstatic.com`;

  const defaultSrcDomains = `'self' *.addthis.com *.addthisedge.com blob: *.vidyard.com https://*.cookielaw.org https://*.bing.com 'self' blob: 'unsafe-inline' 'unsafe-eval' *.visualwebsiteoptimizer.com app.vwo.com useruploads.vwo.io cdn.pushcrew.com`;

  const fontSrcDomains = `'self' fonts.gstatic.com app.vwo.com data:`;

  const frameSrcDomains = `'self' *.addthis.com *.addthisedge.com burly.io *.burly.io static.ads-twitter.com platform.twitter.com *.adsrvr.org *.visualwebsiteoptimizer.com app.vwo.com *.doubleclick.net *.driftt.com *.twitter.com www.google.com www.googletagmanager.com *.contently.com app.vwo.com d1eoo1tco6rr5e.cloudfront.net *.vidyard.com player.flipsnack.com cdn.flipsnack.com *.addthis.com *.addthisedge.com burly.io *.burly.io meetings.grooveapp.com info.gozego.com *.visualwebsiteoptimizer.com app.vwo.com *.ceros.com`;

  const imgSrcDomains = `'self' *.visualwebsiteoptimizer.com app.vwo.com *.adroll.com *.adsymptotic.com www.googletagmanager.com *.google-analytics.com *.addthis.com *.addthisedge.com s3.amazonaws.com *.googleadservices.com cdn.cookielaw.org *.google.com *.google.ad *.google.ae *.google.com.af *.google.com.ag *.google.al *.google.am *.google.co.ao *.google.com.ar *.google.as *.google.at *.google.com.au *.google.az *.google.ba *.google.com.bd *.google.be *.google.bf *.google.bg *.google.com.bh *.google.bi *.google.bj *.google.com.bn *.google.com.bo *.google.com.br *.google.bs *.google.bt *.google.co.bw *.google.by *.google.com.bz *.google.ca *.google.cd *.google.cf *.google.cg *.google.ch *.google.ci *.google.co.ck *.google.cl *.google.cm *.google.cn *.google.com.co *.google.co.cr *.google.com.cu *.google.cv *.google.com.cy *.google.cz *.google.de *.google.dj *.google.dk *.google.dm *.google.com.do *.google.dz *.google.com.ec *.google.ee *.google.com.eg *.google.es *.google.com.et *.google.fi *.google.com.fj *.google.fm *.google.fr *.google.ga *.google.ge *.google.gg *.google.com.gh *.google.com.gi *.google.gl *.google.gm *.google.gr *.google.com.gt *.google.gy *.google.com.hk *.google.hn *.google.hr *.google.ht *.google.hu *.google.co.id *.google.ie *.google.co.il *.google.im *.google.co.in *.google.iq *.google.is *.google.it *.google.je *.google.com.jm *.google.jo *.google.co.jp *.google.co.ke *.google.com.kh *.google.ki *.google.kg *.google.co.kr *.google.com.kw *.google.kz *.google.la *.google.com.lb *.google.li *.google.lk *.google.co.ls *.google.lt *.google.lu *.google.lv *.google.com.ly *.google.co.ma *.google.md *.google.me *.google.mg *.google.mk *.google.ml *.google.com.mm *.google.mn *.google.com.mt *.google.mu *.google.mv *.google.mw *.google.com.mx *.google.com.my *.google.co.mz *.google.com.na *.google.com.ng *.google.com.ni *.google.ne *.google.nl *.google.no *.google.com.np *.google.nr *.google.nu *.google.co.nz *.google.com.om *.google.com.pa *.google.com.pe *.google.com.pg *.google.com.ph *.google.com.pk *.google.pl *.google.pn *.google.com.pr *.google.ps *.google.pt *.google.com.py *.google.com.qa *.google.ro *.google.ru *.google.rw *.google.com.sa *.google.com.sb *.google.sc *.google.se *.google.com.sg *.google.sh *.google.si *.google.sk *.google.com.sl *.google.sn *.google.so *.google.sm *.google.sr *.google.st *.google.com.sv *.google.td *.google.tg *.google.co.th *.google.com.tj *.google.tl *.google.tm *.google.tn *.google.to *.google.com.tr *.google.tt *.google.com.tw *.google.co.tz *.google.com.ua *.google.co.ug *.google.co.uk *.google.com.uy *.google.co.uz *.google.com.vc *.google.co.ve *.google.co.vi *.google.com.vn *.google.vu *.google.ws *.google.rs *.google.co.za *.google.co.zm *.google.co.zw *.google.cat *.google-analytics.com *.analytics.google.com *.googletagmanager.com *.g.doubleclick.net *.google.com *.globalpaymentsinc.com *.globalpayments.com *.bidswitch.net ads.yahoo.com px.ads.linkedin.com data: *.adnxs.com *.openx.net www.facebook.com *.rlcdn.com *.reson8.com *.demdex.net *.company-target.com *.mathtag.com *.bluekai.com app.vwo.com *.linkedin.com i.ytimg.com s3.amazonaws.com *.sharethis.com *.vidyard.com bat.bing.com gateway.zscalerthree.net gateway.zscloud.net ad.doubleclick.net c.clarity.ms c.bing.com www.googletagmanager.com *.visualwebsiteoptimizer.com app.vwo.com useruploads.vwo.io cdn.pushcrew.com *.reddit.com *.googlesyndication.com`;

  const mediaSrcDomains = `'self' *.driftt.com gpnprodsxavideo.azureedge.net gpnprodlegacys3.azureedge.net *.youtube.com *.vidyard.com *.globalpayments.com`;

  const scriptSrcDomains = `'self' 'unsafe-eval' 'unsafe-inline' *.visualwebsiteoptimizer.com app.vwo.com www.googletagmanager.com *.adsrvr.org *.google-analytics.com *.facebook.net pi.pardot.com go.globalpaymentsinc.com go.globalpayments.com go.heartlandpaymentsystems.com go.openedgepayments.com burly.io *.burly.io *.licdn.com *.contently.com *.addthis.com *.addthisedge.com *.moatads.com cdn.cookielaw.org *.doubleclick.net app.vwo.com *.raygun.io cdnjs.cloudflare.com s.ytimg.com *.vidyard.com code.jquery.com *.google.com www.clarity.ms ajax.googleapis.com https://*.cookielaw.org 'unsafe-inline' *.visualwebsiteoptimizer.com app.vwo.com 'unsafe-eval' cdn.pushcrew.com 'self' blob: https://*.ceros.com`;

  const scriptSrcElemDomains = `'self' www.googletagmanager.com *.visualwebsiteoptimizer.com app.vwo.com burly.io *.burly.io *.licdn.com *.google-analytics.com *.addthis.com *.addthisedge.com 'unsafe-inline' pi.pardot.com go.globalpaymentsinc.com go.globalpayments.com go.heartlandpaymentsystems.com go.openedgepayments.com static.ads-twitter.com platform.twitter.com code.jquery.com *.contently.com *.youtube.com *.ytimg.com cdn.cookielaw.org *.moatads.com *.adroll.com *.adsrvr.org *.googleadservices.com *.doubleclick.net *.driftt.com js.zi-scripts.com/zi-tag.js munchkin.marketo.net *.adroll.com connect.facebook.net *.moatads.com www.google.com d.adroll.mgr.consensu.org www.gstatic.com *.raygun.io cdnjs.cloudflare.com *.tsys.com *.sharethis.com *.vidyard.com ajax.googleapis.com bat.bing.com www.clarity.ms gateway.zscloud.net *.omappapi.com info.gozego.com 'unsafe-inline' *.visualwebsiteoptimizer.com app.vwo.com 'unsafe-eval' cdn.pushcrew.com 'self' blob: *.ceros.com scripts.clarity.ms *.redditstatic.com`;

  const styleSrcDomains = `'self' 'unsafe-inline' app.vwo.com 'unsafe-inline' *.visualwebsiteoptimizer.com cdn.pushcrew.com`;

  const styleSrcElemDomains = `'self' fonts.gstatic.com 'unsafe-inline' static.ads-twitter.com platform.twitter.com *.facebook.net www.googletagmanager.com *.adroll.com *.visualwebsiteoptimizer.com app.vwo.com *.adsrvr.org *.licdn.com burly.io *.burly.io fonts.googleapis.com cdn.cookielaw.org *.omappapi.com info.gozego.com 'unsafe-inline' *.visualwebsiteoptimizer.com app.vwo.com cdn.pushcrew.com`;

  const workerSrcDomains = `'self' 'self' blob:`;

  const ContentSecurityPolicy = `connect-src ${connectSrcDomains}; default-src ${defaultSrcDomains}; font-src ${fontSrcDomains}; frame-ancestors 'self'; frame-src ${frameSrcDomains}; img-src ${imgSrcDomains}; media-src ${mediaSrcDomains}; script-src ${scriptSrcDomains}; script-src-elem ${scriptSrcElemDomains}; style-src ${styleSrcDomains}; style-src-elem ${styleSrcElemDomains}; worker-src ${workerSrcDomains};`;

  return ContentSecurityPolicy;
};

/**
 * @param {import('next').NextConfig} nextConfig
 */
const SecurityHeadersPlugin = (nextConfig = {}) => {
  // Only apply baseline headers in non-development environments
  if (process.env.NODE_ENV !== 'development' &&
    process.env.ENABLE_STATIC_SECURITY_HEADERS === 'true') {
    return Object.assign({}, nextConfig, {
      async headers() {
        const extendHeaders =
          typeof nextConfig.headers === 'function' ? await nextConfig.headers() : [];

        const baselineCSP = buildBaselineCSP();

        return [
          ...(await extendHeaders),
          {
            // Apply baseline security headers to all routes
            // Middleware will override CSP with Sitecore-managed values when it runs
            source: '/:path*',
            headers: [
              {
                key: 'Referrer-Policy',
                value: 'strict-origin-when-cross-origin',
              },
              {
                key: 'X-Content-Type-Options',
                value: 'nosniff',
              },
              {
                key: 'X-XSS-Protection',
                value: '1; mode=block',
              },
              {
                key: 'Strict-Transport-Security',
                value: 'max-age=31536000',
              },
              {
                key: 'Content-Security-Policy',
                value: baselineCSP,
              },
            ],
          },
        ];
      },
    });
  }

  return nextConfig;
};

module.exports = SecurityHeadersPlugin;
