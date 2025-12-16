import { NextRequest } from 'next/server';
import * as ipaddr from 'ipaddr.js';
import localDebug from '@/lib/_platform/logging/debug-log';

/**
 * Extracts the client's real IP address from various headers.
 *
 * The x-forwarded-for header may contain multiple IPs in the format:
 * "client_ip, proxy1_ip, proxy2_ip, internal_ip"
 * - client_ip: The original client's public IP (most reliable)
 * - proxy1_ip: First proxy/CDN server IP
 * - proxy2_ip: Second proxy/load balancer IP
 * - internal_ip: Internal server/container IP
 *
 * We need to skip private/internal IP ranges to find the real client IP.
 */
export function getClientIp(req: NextRequest): string | null {
  // Array of headers to check in order of preference
  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-vercel-forwarded-for', // Vercel
    'x-client-ip',
    'x-cluster-client-ip',
    'forwarded-for',
    'forwarded',
  ];

  for (const header of ipHeaders) {
    const headerValue = req.headers.get(header);
    if (headerValue) {
      const publicIp = extractPublicIp(headerValue);
      if (publicIp) {
        localDebug.geolocation(`[Geolocation] Extracted IP from ${header}: ${publicIp}`);
        return publicIp;
      }
    }
  }

  // Fallback to req.ip
  localDebug.geolocation('[Geolocation] No headers found, using req.ip', req.ip);
  return req.ip || null;
}

/**
 * Extracts the first public IP from a comma-separated list of IPs
 * Skips private/internal IP ranges
 */
function extractPublicIp(ipString: string): string | null {
  const ips = ipString.split(',').map((ip) => ip.trim());
  localDebug.geolocation(`[Geolocation] Extracting public IP from: ${ips.join(', ')}`);

  for (const ip of ips) {
    if (isPublicIp(ip)) {
      return ip;
    }
  }

  return null;
}

/**
 * Checks if an IP address is public (not private/internal)
 * Uses ipaddr.js for robust IP validation and range detection
 */
function isPublicIp(ip: string): boolean {
  try {
    const addr = ipaddr.process(ip);

    // Check if it's a private range
    if (addr.kind() === 'ipv4') {
      const range = addr.range();
      // Public IPv4 addresses have no special range or are 'unicast'
      return !range || range === 'unicast';
    } else if (addr.kind() === 'ipv6') {
      const range = addr.range();
      // For IPv6, we consider it public if it's not a loopback or link-local address
      return range !== 'loopback' && range !== 'linkLocal';
    }
  } catch (e) {
    // Invalid IP format, treat as non-public
  }

  return false;
}
