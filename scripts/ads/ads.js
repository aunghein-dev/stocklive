document.addEventListener("DOMContentLoaded", () => {
  (function () {
    const adContainer = document.getElementById("ad-container");
    const isDesktop = window.innerWidth >= 768;

    if (!adContainer) return;

    // Scrollable wrapper
    const scrollWrapper = document.createElement("div");
    scrollWrapper.style.display = "flex";
    scrollWrapper.style.justifyContent = "center";
    scrollWrapper.style.overflowX = "auto";
    scrollWrapper.style.overflowY = "hidden";
    scrollWrapper.style.whiteSpace = "nowrap";
    scrollWrapper.style.marginTop = "16px";
    scrollWrapper.style.marginBottom = "-24px";

    // Hide scrollbars
    scrollWrapper.style.scrollbarWidth = "none"; // Firefox
    scrollWrapper.style.msOverflowStyle = "none"; // IE/Edge

    // Hide Webkit scrollbar
    const style = document.createElement("style");
    style.textContent = `
      #ad-container div::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);

    const innerDiv = document.createElement("div");
    innerDiv.style.display = "inline-block";
    innerDiv.style.textAlign = "center";
    innerDiv.style.width = isDesktop ? "728px" : "468px";
    innerDiv.style.flexShrink = "0";

    // Ad options config script
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

    // Ad load script
    const loadScript = document.createElement("script");
    loadScript.type = "text/javascript";
    loadScript.src = isDesktop
      ? "//www.highperformanceformat.com/a9111780b650f3a51d225135329b9d02/invoke.js"
      : "https://www.highperformanceformat.com/8f1346b00d0c22107fcc4328d8a37194/invoke.js";

    innerDiv.appendChild(loadScript);
    scrollWrapper.appendChild(innerDiv);
    adContainer.appendChild(scrollWrapper);
  })();
});
