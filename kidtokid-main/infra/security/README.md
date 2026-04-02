# NGINX + Fail2ban Hardening (KidtoKid)

This folder contains an opinionated hardening baseline to mitigate:
- automated vulnerability scanners
- high-rate request abuse
- malicious User-Agents
- simple path fuzzing based on repeated 404s

## Files

- `nginx/kidtokid-hardening.conf`: NGINX server config with silent drops, strict rate limits and scanner UA filtering.
- `fail2ban/filter.d/nginx-rate-limit.conf`: filter that detects NGINX `limit_req` violations.
- `fail2ban/filter.d/nginx-404-fuzzing.conf`: filter that detects repeated 404 probing.
- `fail2ban/jail.d/nginx-hardening.local`: jails that ban offending IPs for 1 hour.

## Important notes

1. Your app appears to have a valid `/admin` route. If that route is required, remove `admin` from the sensitive-path regex in `nginx/kidtokid-hardening.conf`.
2. If you are behind Cloudflare, configure Real IP first; otherwise fail2ban may ban Cloudflare edge IPs instead of attacker IPs.

## Linux server install steps

### 1) Copy NGINX config

```bash
sudo cp infra/security/nginx/kidtokid-hardening.conf /etc/nginx/sites-available/kidtokid.conf
sudo ln -s /etc/nginx/sites-available/kidtokid.conf /etc/nginx/sites-enabled/kidtokid.conf
sudo nginx -t
sudo systemctl reload nginx
```

### 2) Install and configure fail2ban

```bash
sudo apt-get update
sudo apt-get install -y fail2ban

sudo cp infra/security/fail2ban/filter.d/nginx-rate-limit.conf /etc/fail2ban/filter.d/
sudo cp infra/security/fail2ban/filter.d/nginx-404-fuzzing.conf /etc/fail2ban/filter.d/
sudo cp infra/security/fail2ban/jail.d/nginx-hardening.local /etc/fail2ban/jail.d/

sudo systemctl enable fail2ban
sudo systemctl restart fail2ban
sudo fail2ban-client status
```

## How to test defenses

### Test A: Silent drop for sensitive path

```bash
curl -i http://YOUR_DOMAIN/.env
```

Expected result: dropped/empty response (NGINX 444 behavior), not an informative 404 page.

### Test B: Malicious User-Agent block

```bash
curl -i -A "sqlmap/1.7" http://YOUR_DOMAIN/
```

Expected result: immediate silent drop (connection closed).

### Test C: Rate limiting 5 req/s + 1h ban

```bash
for i in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}\n" http://YOUR_DOMAIN/; done
sudo fail2ban-client status nginx-rate-limit
```

Expected result: multiple `429` responses, then IP appears in `Banned IP list` for 3600s.

### Test D: 404 fuzzing detection

```bash
for p in a1 a2 a3 a4 a5; do curl -s -o /dev/null -w "%{http_code}\n" http://YOUR_DOMAIN/$p; done
sudo fail2ban-client status nginx-404-fuzzing
```

Expected result: after >3 misses in short window, source IP gets banned for 1 hour.

## Optional Cloudflare Real IP (recommended when proxied)

Add Cloudflare IP ranges to NGINX and set:

```nginx
real_ip_header CF-Connecting-IP;
set_real_ip_from <cloudflare-range-1>;
set_real_ip_from <cloudflare-range-2>;
# ... all official Cloudflare ranges
```

Then reload NGINX.
