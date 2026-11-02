/**
 * Set NEXT_PUBLIC_BASE_PATH (e.g. "/azure") to serve the site under a sub-path,
 * like erenkad.com/azure. Leave it unset to serve from the root.
 *
 * @type {import('next').NextConfig}
 */
module.exports = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};
