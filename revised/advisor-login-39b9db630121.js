(() => {
  const dialog = document.createElement('dialog');
  dialog.className = 'advisor-login';
  dialog.lang = 'en';
  dialog.setAttribute('aria-labelledby', 'advisor-login-title');
  dialog.setAttribute('aria-describedby', 'advisor-login-description');
  dialog.innerHTML = `
    <button class="advisor-login-close" type="button" aria-label="Close login">×</button>
    <div class="advisor-login-mark" aria-hidden="true"><img src="./assets/bole-logo.svg" alt=""></div>
    <h2 id="advisor-login-title">Welcome back</h2>
    <p id="advisor-login-description">Enter your credentials to login to your account.</p>
    <form>
      <label for="advisor-login-email">Email</label>
      <input id="advisor-login-email" type="email" autocomplete="username" placeholder="hi@yourcompany.com" autofocus required>
      <label for="advisor-login-password">Password</label>
      <input id="advisor-login-password" type="password" autocomplete="current-password" placeholder="Enter your password" required>
      <div class="advisor-login-options">
        <label><input type="checkbox"> Remember me</label>
        <button type="button" data-login-action="reset">Forgot password?</button>
      </div>
      <button class="advisor-login-primary" type="submit">Sign in</button>
      <div class="advisor-login-divider">Or</div>
      <button class="advisor-login-google" type="button" data-login-action="google">Login with Google</button>
      <p class="advisor-login-feedback" role="status" hidden></p>
    </form>`;
  document.body.append(dialog);

  const form = dialog.querySelector('form');
  const feedback = dialog.querySelector('[role="status"]');
  const password = dialog.querySelector('input[type="password"]');
  const email = dialog.querySelector('input[type="email"]');
  const remember = dialog.querySelector('input[type="checkbox"]');
  const submit = dialog.querySelector('button[type="submit"]');
  const emailKey = 'bole:advisor-email';
  const endpoint = 'https://1529105292-7jbpva7hp9.ap-guangzhou.tencentscf.com';
  let trigger;
  let pending;

  try {
    email.defaultValue = localStorage.getItem(emailKey) ?? '';
    remember.defaultChecked = Boolean(email.defaultValue);
  } catch {
    // Sign-in still works if browser storage is unavailable.
  }

  function showFeedback(message) {
    feedback.hidden = false;
    feedback.textContent = message;
  }

  document.addEventListener('click', event => {
    const link = event.target instanceof Element
      ? event.target.closest('a.patent-browse[href="#advisor"]')
      : null;
    if (!link || link.textContent.trim() !== '进入专利转化顾问') return;
    event.preventDefault();
    if (dialog.open) return;
    trigger = link;
    dialog.showModal();
  });

  dialog.querySelector('.advisor-login-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    pending?.abort();
    pending = undefined;
    submit.disabled = false;
    submit.textContent = 'Sign in';
    form.reset();
    feedback.hidden = true;
    feedback.textContent = '';
    trigger?.focus({ preventScroll: true });
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending) return;
    const secret = password.value;
    const attempt = new AbortController();
    pending = attempt;
    feedback.hidden = true;
    submit.disabled = true;
    submit.classList.add('is-loading');
    submit.textContent = 'Signing in…';

    try {
      const auth = btoa(String.fromCharCode(...new TextEncoder().encode('reviewer:' + secret)));
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + auth },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'Reply with OK only.' }] }),
        signal: AbortSignal.any([attempt.signal, AbortSignal.timeout(20000)]),
      });
      if (attempt.signal.aborted || !dialog.open) return;
      if (response.status === 401 || response.status === 403) {
        showFeedback('评审口令不正确，请重试。');
        password.focus();
        password.select();
        return;
      }
      const result = await response.json();
      if (!response.ok || typeof result.answer !== 'string' || !result.answer.trim()) {
        throw new Error('Advisor validation did not complete');
      }

      try {
        sessionStorage.setItem('bole:advisor-session-email', email.value);
        email.defaultValue = remember.checked ? email.value : '';
        remember.defaultChecked = remember.checked;
        if (remember.checked) localStorage.setItem(emailKey, email.value);
        else localStorage.removeItem(emailKey);
      } catch {
        // Remembering the email is optional.
      }

      window.takeBoleReviewPassword = () => {
        delete window.takeBoleReviewPassword;
        return secret;
      };
      dialog.close();
      window.location.hash = '#advisor';
    } catch {
      if (!attempt.signal.aborted && dialog.open) showFeedback('暂时无法验证口令，请稍后重试。');
    } finally {
      if (pending === attempt) {
        pending = undefined;
        submit.disabled = false;
        submit.classList.remove('is-loading');
        submit.textContent = 'Sign in';
      }
    }
  });
  dialog.querySelector('[data-login-action="reset"]').addEventListener('click', () => {
    showFeedback('Password reset is not available yet.');
  });
  dialog.querySelector('[data-login-action="google"]').addEventListener('click', () => {
    showFeedback('Google sign-in is not available yet.');
  });
})();
