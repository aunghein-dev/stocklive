const vpnDeniedUrl = "/vpn-denied.html";

function checkVPNAndGeo() {
  fetch("https://api.myanmarlive2d3d.online/check-ip")
    .then(response => response.json())
    .then(data => {
      console.log("Check IP Response:", data);

      if (data.access === "deny") {
        window.location.href = vpnDeniedUrl;
      } else {
        console.log("Access allowed.");
      }
    })
    .catch(error => {
      console.error("IP check failed:", error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  checkVPNAndGeo();
});