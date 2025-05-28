const API_TOKEN = window.IPINFO_TOKEN;

// ✅ Tier 1 countries that can use VPNs
const allowedCountries = ["US", "GB", "CA", "AU", "DE"];

const vpnDeniedUrl = "/vpn-denied.html";

function checkVPNAndGeo() {
fetch(`${window.IPINFO_BASE_URL}${API_TOKEN}`)
    .then(response => response.json())
    .then(data => {
      const org = data.org ? data.org.toLowerCase() : "";
      const hostname = data.hostname ? data.hostname.toLowerCase() : "";
      const country = data.country;


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
       
        return;
      }

      // ❌ If VPN detected and not Tier 1 → block
      if (isVPN && !isTier1) {
        console.warn("VPN detected in non-Tier 1 country. Blocking access.");
        window.location.href = vpnDeniedUrl;
        return;
      }
      
    })
    .catch(error => {
      console.error("Error checking IP info:", error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  checkVPNAndGeo();
});
