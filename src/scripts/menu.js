document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const lines = document.querySelectorAll('.hamburger .line');

  // Function to open drawer
  const openDrawer = () => {
    mobileDrawer.classList.remove('translate-x-full');
    mobileOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Animate hamburger lines
    lines.forEach((line, index) => {
      const lineElement = line;
      if (index === 0) {
        lineElement.style.transform = 'rotate(45deg) translate(5px, 5px)';
      } else if (index === 1) {
        lineElement.style.opacity = '0';
      } else if (index === 2) {
        lineElement.style.transform = 'rotate(-45deg) translate(7px, -6px)';
      }
    });
  };

  // Function to close drawer
  const closeDrawerFunc = () => {
    mobileDrawer.classList.add('translate-x-full');
    mobileOverlay.classList.add('hidden');
    document.body.style.overflow = '';

    // Reset hamburger lines
    lines.forEach((line, index) => {
      const lineElement = line;
      if (index === 0) {
        lineElement.style.transform = 'rotate(0deg)';
      } else if (index === 1) {
        lineElement.style.opacity = '1';
      } else if (index === 2) {
        lineElement.style.transform = 'rotate(0deg)';
      }
    });
  };

  // Open drawer on hamburger click
  hamburger?.addEventListener('click', openDrawer);

  // Close drawer on overlay click
  mobileOverlay?.addEventListener('click', closeDrawerFunc);

  // Close drawer on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileDrawer.classList.contains('translate-x-full')) {
      closeDrawerFunc();
    }
  });

  // Use event delegation for close button and navigation links
  document.addEventListener('click', (e) => {
    // Close button click
    if (e.target.closest('#closeDrawerBtn')) {
      closeDrawerFunc();
    }

    // Navigation links click (close drawer after navigation)
    if (e.target.closest('#mobileDrawer a')) {
      setTimeout(closeDrawerFunc, 100);
    }
  });
});
