// EmailJS 공개 설정값: Public Key만 브라우저에 공개하며 나머지 값은 EmailJS 서비스 식별자입니다.
const SITE_URL = 'https://yahosam.vercel.app';
const EMAILJS_PUBLIC_KEY = 'tQPKB1WtpdlRoH_Td';
const EMAILJS_SERVICE_ID = 'service_4v5v7dd';
const EMAILJS_TEMPLATE_ID = 'template_1v8vdj2'; // 접수 알림
const EMAILJS_AUTOREPLY_ID = 'template_tveu8oc'; // 자동회신

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

// 개인정보 상세 내용을 같은 위치에서 펼치고 접어 사용자가 즉시 확인할 수 있게 합니다.
const privacyDetailToggle = document.querySelector('.privacy-detail-toggle');
const privacyDetail = document.querySelector('#privacy-detail');

if (privacyDetailToggle && privacyDetail) {
  privacyDetailToggle.addEventListener('click', () => {
    const isExpanded = privacyDetailToggle.getAttribute('aria-expanded') === 'true';
    privacyDetailToggle.setAttribute('aria-expanded', String(!isExpanded));
    privacyDetail.hidden = isExpanded;
    privacyDetailToggle.textContent = isExpanded ? '전문 보기' : '전문 닫기';
  });
}

// EmailJS 문의 폼을 검증하고 접수 알림과 문의자 자동회신을 순서대로 발송합니다.
const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

if (contactForm && formStatus && window.emailjs) {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  const privacyCheckbox = contactForm.querySelector('input[name="privacy_agreed"]');
  const submitButton = contactForm.querySelector('.form-submit');
  submitButton.disabled = true;

  privacyCheckbox.addEventListener('change', () => {
    submitButton.disabled = !privacyCheckbox.checked;
    if (privacyCheckbox.checked && formStatus.classList.contains('is-error')) {
      formStatus.textContent = '';
      formStatus.className = 'form-status';
    }
  });

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const privacyAgreed = formData.get('privacy_agreed') === '동의함';
    if (!contactForm.reportValidity()) return;
    if (!privacyAgreed) {
      formStatus.textContent = '개인정보 수집 · 이용에 동의해 주세요.';
      formStatus.className = 'form-status is-error';
      return;
    }

    const agreedAt = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const templateParams = {
      from_name: formData.get('from_name'),
      from_email: formData.get('from_email'),
      phone: formData.get('phone') || '-',
      company: formData.get('company') || '-',
      inquiry_type: formData.get('inquiry_type'),
      message: formData.get('message'),
      to_email: 'yahogee41@gmail.com',
      reply_to: formData.get('from_email'),
      submitted_at: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      page_url: window.location.href || SITE_URL,
      privacy_agreed: '동의함',
      agreed_at: agreedAt
    };

    submitButton.disabled = true;
    formStatus.textContent = '문의 내용을 전송하고 있습니다...';
    formStatus.className = 'form-status is-loading';

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_AUTOREPLY_ID, templateParams);
      contactForm.reset();
      formStatus.textContent = '문의가 접수되었습니다. 확인 후 답변드리겠습니다.';
      formStatus.className = 'form-status is-success';
    } catch (error) {
      console.error('EmailJS 문의 전송 실패:', error);
      formStatus.textContent = '전송에 실패했습니다. 잠시 후 다시 시도해 주세요.';
      formStatus.className = 'form-status is-error';
    } finally {
      submitButton.disabled = false;
    }
  });
} else if (contactForm && formStatus) {
  formStatus.textContent = '문의 기능을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
  formStatus.className = 'form-status is-error';
}
