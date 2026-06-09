const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

let activeScrollAnimation = null;

export function smoothScrollTo(targetY, duration = 820) {
  if (activeScrollAnimation) {
    cancelAnimationFrame(activeScrollAnimation);
  }

  const startY = window.scrollY;
  const distance = targetY - startY;

  if (Math.abs(distance) < 1) return;

  const startTime = performance.now();

  const step = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * easedProgress);

    if (progress < 1) {
      activeScrollAnimation = requestAnimationFrame(step);
    } else {
      activeScrollAnimation = null;
    }
  };

  activeScrollAnimation = requestAnimationFrame(step);
}

export function scrollToElementWithOffset(id, offset = 92, duration) {
  const element = document.getElementById(id);
  if (!element) return;

  const bodyRect = document.body.getBoundingClientRect().top;
  const elementRect = element.getBoundingClientRect().top;
  const elementPosition = elementRect - bodyRect;

  smoothScrollTo(elementPosition - offset, duration);
}
