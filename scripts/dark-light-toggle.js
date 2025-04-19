function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeSwitch(isDark);
}

function updateThemeSwitch(isDark) {
  const lightIcon = document.querySelector('.js-theme-switch-light');
  const darkIcon = document.querySelector('.js-theme-switch-dark');

  if (lightIcon && darkIcon) {
    // Use opacity and visibility for smooth transition
    lightIcon.style.opacity = isDark ? '0' : '1';
    lightIcon.style.visibility = isDark ? 'hidden' : 'visible';
    darkIcon.style.opacity = isDark ? '1' : '0';
    darkIcon.style.visibility = isDark ? 'visible' : 'hidden';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const isDark = localStorage.getItem("theme") === "dark";
  document.documentElement.classList.toggle("dark-mode", isDark);
  updateThemeSwitch(isDark);
});

document.querySelectorAll('.js-theme-switch').forEach(button => {
  button.addEventListener('click', toggleTheme);
});
