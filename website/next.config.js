/**
 * Set NEXT_PUBLIC_BASE_PATH (e.g. "/azure") to serve the site under a sub-path,
 * like erenkad.com/azure. Leave it unset to serve from the root.
 *
 * @type {import('next').NextConfig}
 */
module.exports = {
  // Static HTML in out/, published to Codeberg Pages by infra/publish-pages.sh.
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};
