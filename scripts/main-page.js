const textArray = [
  "မင်္ဂလာရှိသောနေ့ရက်လေး ဖြစ်ကြပါစေ...🌻",
  "တစ်နေ့တာ ကိစ္စအဝဝ အားလုံးအဆင်ပြေကြပါစေ...💜",
  "Thank you for visiting our website.",
  "We sincerely appreciate your support and look forward to serving you."
];

let index = 0;
const textElement = document.querySelector(".scrolling-text");

function updateText() {
  textElement.style.animation = "none"; // Stop animation to change text
  textElement.innerText = textArray[index]; 
  textElement.style.transform = "translateX(100vw)"; // Reset position
  void textElement.offsetWidth; // Force reflow to restart animation
  textElement.style.animation = "scrollingText 18s linear infinite"; // Restart animation
  
  index = (index + 1) % textArray.length; // Cycle through text
}

textElement.addEventListener("animationiteration", updateText);

// Force first update on page load
updateText();
// Sidebar Toggle
document.querySelector('.js-navi-menu-button').addEventListener('click', () => {
  const asideBar = document.querySelector('.js-left-aside-bar');
  const blurMain = document.querySelector('.js-blur-main');

  if (asideBar.classList.contains('left-aside-bar-visible')) {
    asideBar.classList.remove('left-aside-bar-visible');
    blurMain.classList.remove('active');
  } else {
    asideBar.classList.add('left-aside-bar-visible');
    blurMain.classList.add('active');
  }
});

// Click on blur area to close sidebar
document.querySelector('.js-blur-main').addEventListener('click', () => {
  document.querySelector('.js-left-aside-bar').classList.remove('left-aside-bar-visible');
  document.querySelector('.js-blur-main').classList.remove('active');
});

// Improved Tab Switching Detection
let lastHiddenTime = null;

document.addEventListener("visibilitychange", () => {
  const asideBar = document.querySelector('.js-left-aside-bar');
  const blurMain = document.querySelector('.js-blur-main');

  if (document.hidden) {
    // Tab was hidden (user switched tabs or minimized window)
    lastHiddenTime = Date.now();
  } else {
    // Tab becomes visible again
    const now = Date.now();
    if (lastHiddenTime && now - lastHiddenTime > 300) {
      // Close sidebar if tab was hidden for longer than 300ms
      asideBar.classList.remove('left-aside-bar-visible');
      blurMain.classList.remove('active');
    }
    lastHiddenTime = null;
  }
});
