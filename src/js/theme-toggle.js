(function() {
  'use strict';
  
  // Get saved theme from localStorage or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  
  // Apply theme immediately to prevent flash
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    // Create theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.id = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Toggle theme');
    themeToggle.innerHTML = savedTheme === 'light' 
      ? '<span aria-hidden="true">L</span>' 
      : '<span aria-hidden="true">D</span>';
    
    // Insert toggle button in header
    const header = document.querySelector('header');
    if (header) {
      header.appendChild(themeToggle);
    }
    
    // Toggle theme function
    function toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      // Update theme
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // Save to localStorage
      localStorage.setItem('theme', newTheme);
      
      // Update button text to show current theme
      themeToggle.innerHTML = newTheme === 'light' 
        ? '<span aria-hidden="true">L</span>' 
        : '<span aria-hidden="true">D</span>';
      
      // Update aria-label
      themeToggle.setAttribute('aria-label', `Switch to ${newTheme === 'dark' ? 'light' : 'dark'} mode`);
    }
    
    // Add click event listener
    themeToggle.addEventListener('click', toggleTheme);
    
    // Set initial aria-label
    themeToggle.setAttribute('aria-label', `Switch to ${savedTheme === 'dark' ? 'light' : 'dark'} mode`);
  });
})();
