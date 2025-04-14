document.addEventListener("DOMContentLoaded", () => {
  (function () {
    const adContainer = document.getElementById("ad-container");
    const isDesktop = window.innerWidth >= 768;

    if (!adContainer) return;

    if (isDesktop) {
      const wrapper = document.createElement("div");
      wrapper.style.textAlign = "center";
      wrapper.style.marginTop = "16px";
      wrapper.style.marginBottom = "-24px";

      const innerDiv = document.createElement("div");
      innerDiv.style.display = "inline-block";
      innerDiv.style.width = "728px";

      const configScript = document.createElement("script");
      configScript.type = "text/javascript";
      configScript.innerHTML = `
        atOptions = {
          key: 'a9111780b650f3a51d225135329b9d02',
          format: 'iframe',
          height: 90,
          width: 728,
          params: {}
        };
      `;

      const loadScript = document.createElement("script");
      loadScript.type = "text/javascript";
      loadScript.src = "//www.highperformanceformat.com/a9111780b650f3a51d225135329b9d02/invoke.js";

      innerDiv.appendChild(configScript);
      innerDiv.appendChild(loadScript);
      wrapper.appendChild(innerDiv);
      adContainer.appendChild(wrapper);
    } else {
      const wrapper = document.createElement("div");
      wrapper.style.overflowX = "auto";
      wrapper.style.textAlign = "center";
      wrapper.style.marginTop = "16px";
      wrapper.style.marginBottom = "-24px";

      const innerDiv = document.createElement("div");
      innerDiv.style.display = "inline-block";
      innerDiv.style.width = "468px";

      const configScript = document.createElement("script");
      configScript.type = "text/javascript";
      configScript.innerHTML = `
        atOptions = {
          key: '8f1346b00d0c22107fcc4328d8a37194',
          format: 'iframe',
          height: 60,
          width: 468,
          params: {}
        };
      `;

      const loadScript = document.createElement("script");
      loadScript.type = "text/javascript";
      loadScript.src = "https://www.highperformanceformat.com/8f1346b00d0c22107fcc4328d8a37194/invoke.js";

      innerDiv.appendChild(configScript);
      innerDiv.appendChild(loadScript);
      wrapper.appendChild(innerDiv);
      adContainer.appendChild(wrapper);
    }
  })();
});
