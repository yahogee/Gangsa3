const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.querySelectorAll('.faq-list details').forEach((item) => {
  item.addEventListener('toggle', () => {
    const symbol = item.querySelector('summary span');
    if (symbol) symbol.textContent = item.open ? '−' : '＋';
  });
});

// 강사 소개 전문을 별도 페이지의 본문에서 불러와 현재 화면 아래에 펼칩니다.
const aboutToggle = document.querySelector('.about-toggle');
const aboutStory = document.querySelector('#about-story');

if (aboutToggle && aboutStory) {
  aboutToggle.addEventListener('click', async () => {
    const isOpen = aboutStory.classList.contains('is-open');

    if (!isOpen && !aboutStory.dataset.loaded) {
      const response = await fetch('about.html');
      const html = await response.text();
      const documentParser = new DOMParser();
      const parsedDocument = documentParser.parseFromString(html, 'text/html');
      const sourceArticle = parsedDocument.querySelector('.article-shell');
      aboutStory.innerHTML = sourceArticle ? sourceArticle.innerHTML : '<p>소개 내용을 불러오지 못했습니다.</p>';
      aboutStory.dataset.loaded = 'true';
    }

    aboutStory.classList.toggle('is-open', !isOpen);
    aboutStory.setAttribute('aria-hidden', String(isOpen));
    aboutToggle.setAttribute('aria-expanded', String(!isOpen));
    aboutToggle.querySelector('span').textContent = isOpen ? '↓' : '↑';
  });
}
