const API_TOKEN = '82e9d8a31bf7e1';

// ✅ Tier 1 countries that can use VPNs
const allowedCountries = ["US", "GB", "CA", "AU", "DE"];

const vpnDeniedUrl = "/vpn-denied.html";

function checkVPNAndGeo() {
  fetch(`https://ipinfo.io/json?token=${API_TOKEN}`)
    .then(response => response.json())
    .then(data => {
      const org = data.org ? data.org.toLowerCase() : "";
      const hostname = data.hostname ? data.hostname.toLowerCase() : "";
      const country = data.country;

      //console.log("IPinfo Response:", data);

      const suspiciousOrgs = [
        "vpn", "proxy", "datacenter", "host", "cloud",
        "ovh", "digitalocean", "google", "amazon", "linode"
      ];

      const isVPN = suspiciousOrgs.some(keyword =>
        org.includes(keyword) || hostname.includes(keyword)
      );

      const isTier1 = allowedCountries.includes(country);

      // ✅ If user is from Tier 1 country → always allow
      if (isTier1) {
        //console.log("User from Tier 1 country. Access allowed.");
        return;
      }

      // ❌ If VPN detected and not Tier 1 → block
      if (isVPN && !isTier1) {
        console.warn("VPN detected in non-Tier 1 country. Blocking access.");
        window.location.href = vpnDeniedUrl;
        return;
      }
      

      // ✅ All others (non-VPN, non-Tier 1) → allow
      //console.log("Access allowed (non-VPN, non-Tier 1).");
    })
    .catch(error => {
      console.error("Error checking IP info:", error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  checkVPNAndGeo();
});
