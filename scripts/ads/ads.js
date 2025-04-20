document.addEventListener("DOMContentLoaded", () => {
  (function () {
    const adContainer = document.getElementById("ad-container");
    const isDesktop = window.innerWidth >= 768;

    if (!adContainer) return;

    const wrapper = document.createElement("div");
    wrapper.style.textAlign = "center";
    wrapper.style.marginTop = "16px";
    wrapper.style.marginBottom = "-24px";

    const innerDiv = document.createElement("div");
    innerDiv.style.display = "inline-block";
    innerDiv.style.width = isDesktop ? "728px" : "468px";

    // Append the config script directly to the document head so it executes
    const configScript = document.createElement("script");
    configScript.type = "text/javascript";
    configScript.text = `
      atOptions = {
        key: '${isDesktop ? "a9111780b650f3a51d225135329b9d02" : "8f1346b00d0c22107fcc4328d8a37194"}',
        format: 'iframe',
        height: ${isDesktop ? 90 : 60},
        width: ${isDesktop ? 728 : 468},
        params: {}
      };
    `;
    document.head.appendChild(configScript);

    // Create the loader script and append to the inner div
    const loadScript = document.createElement("script");
    loadScript.type = "text/javascript";
    loadScript.src = isDesktop
      ? "//www.highperformanceformat.com/a9111780b650f3a51d225135329b9d02/invoke.js"
      : "https://www.highperformanceformat.com/8f1346b00d0c22107fcc4328d8a37194/invoke.js";

    innerDiv.appendChild(loadScript);
    wrapper.appendChild(innerDiv);
    adContainer.appendChild(wrapper);
  })();
});
