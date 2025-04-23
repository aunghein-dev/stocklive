import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';


                                                                                                                                                                                                                                                        

























































































//


//
//
//













//

//

//




//


//
//
//













//

//

//



//


//
//
//













//

//

//



//


//
//
//













//

//

//



//


//
//
//













//

//

//



//


//
//
//













//

//

//



//


//
//
//













//

//

//



//


//
//
//













//

//

//



//


//
//
//













//

//

//



//


//
//
//













//

//

//



//


//
//
//













//

//

//



//


//
//
//













//

//

//



//


//
//
//













//

//

//



//


//
//
//













//

//

//



//


//
//
//













//

//

//



const energy ="https://api.myanmarlive2d3d.online/matches";
const matchesContainer = document.getElementById("matches");
const filterBtns = document.querySelectorAll(".filter-btn");
let allMatches = [];
let hls;

// Fetch once, then render & filter
async function init() {
  try {
    const res = await fetch(energy);
    allMatches = await res.json();
  } catch {
    document.querySelector(".loading-page").innerHTML =
      "<p style='color:red'>Failed to load.</p>";
    return;
  }
  applyFilter("all");
  document.querySelector('.loading-page').classList.add('inactive')
}


// Attach filter button listeners
filterBtns.forEach((btn) => {
btn.addEventListener("click", () => {
  filterBtns.forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  applyFilter(btn.dataset.status);
});
});

// Render based on status
function applyFilter(status) {
  document.querySelector('.loading-page').classList.add('active');
const filtered =
  status === "all"
    ? allMatches
    : allMatches.filter((m) => m.match_status === status);
render(filtered);
document.querySelector('.loading-page').classList.add('inactive')
}

// Render cards
function render(matches) {
matchesContainer.innerHTML = "";
if (matches.length === 0) {
  matchesContainer.innerHTML = "<p>No matches in this category.</p>";
  return;
}
matches.forEach((match) => {
  const card = document.createElement("div");
  card.className = "match-card";

  const date = new Date(match.match_time * 1000).toLocaleString();
  let statusLabel;
  if (match.match_status === "live") statusLabel = "🔴 LIVE";
  else if (match.match_status === "finished")
    statusLabel = "✅ Finished";
  else statusLabel = `${dayjs(date).format("h:mm A")}`;

  // only show stream btns when live
      const streamsHTML =
      match.match_status === "live"
        ? `<div class="streams">
            ${match.servers
              .map(
                (s, i) => `
                  <button class="stream-btn" onclick="playStream('${s.stream_url}')">
                     ${(s.name).substring(5, 7)} ${i + 1}
                  </button>`
              )
              .join("")}
          </div>`
        : "";


  const viewerCount = Math.floor(Math.random() * 10000) + 500;

  card.innerHTML = `
   <div class="league">${match.league_name}</div>
    <div class="teams">
    <div class="team">
      <img src="${match.home_team_logo}" alt="" />
      <span>${match.home_team_name}</span>
    </div>
    <span style="opacity:.7">Vs</span>
    <div class="team">
      <img src="${match.away_team_logo}" alt="" />
      <span>${match.away_team_name}</span>
    </div>
  </div>
 
  <div class="status">${statusLabel}</div>
  <!-- <div class="viewer-count">👀 ${viewerCount.toLocaleString()} watching</div> -->
  ${streamsHTML}
`;
  matchesContainer.appendChild(card);
});
}



init();

window.playStream = function (url) {
  const modal = document.getElementById("videoModal");
  const video = document.getElementById("videoPlayer");

  modal.classList.add("active");

  // Stop current video if any
  if (!video.paused) {
    video.pause();
  }

  // Reset video source to prevent AbortError
  video.removeAttribute("src");
  video.load(); // Force video reset

  // Destroy any existing HLS instance
  if (hls) {
    hls.destroy();
    hls = null;
  }

  if (Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch((e) => {
        console.warn("Video play failed:", e);
      });
    });
  } else {
    video.src = url;
    video.play().catch((e) => {
      console.warn("Video play failed:", e);
    });
  }
};
window.closePlayer = function () {
  const modal = document.getElementById("videoModal");
  const video = document.getElementById("videoPlayer");

  modal.classList.remove("active");

  if (hls) {
    hls.destroy();
    hls = null;
  }

  video.pause();
  video.removeAttribute("src");
  video.load(); // Reset the player
};



