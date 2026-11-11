(() => {
  const dialog = document.createElement('dialog');
  dialog.className = 'advisor-login';
  dialog.lang = 'en';
  dialog.setAttribute('aria-labelledby', 'advisor-login-title');
  dialog.setAttribute('aria-describedby', 'advisor-login-description');
  dialog.innerHTML = `
    <button class="advisor-login-close" type="button" aria-label="Close login">×</button>
    <div class="advisor-login-mark" aria-hidden="true"><span></span></div>
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
  let trigger;

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
    form.reset();
    feedback.hidden = true;
    feedback.textContent = '';
    trigger?.focus({ preventScroll: true });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    password.value = '';
    showFeedback('Account sign-in is not available yet.');
  });
  dialog.querySelector('[data-login-action="reset"]').addEventListener('click', () => {
    showFeedback('Password reset is not available yet.');
  });
  dialog.querySelector('[data-login-action="google"]').addEventListener('click', () => {
    showFeedback('Google sign-in is not available yet.');
  });
})();
