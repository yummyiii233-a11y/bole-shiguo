(() => {
window.BOLE_AGENT_ENDPOINT = 'https://bole-agent-urezcyvpms.cn-hangzhou.fcapp.run';
const form = document.querySelector('#chat');
const question = document.querySelector('#question');
const password = document.querySelector('#password');
const conversation = document.querySelector('#conversation');
const status = document.querySelector('#status');
const send = document.querySelector('#send');
const reset = document.querySelector('#reset');
const history = [];
const patent = new URLSearchParams(location.search).get('patent');
if (patent && /^CN-\d+-[A-Z]\d?$/.test(patent)) {
  question.value = '分析 ' + patent + ' 的转化准备度，并列出下一步需要核验的事项。';
}

function show(role, content, model, sources = []) {
  const card = document.createElement('article');
  card.dataset.role = role;
  const name = document.createElement('strong');
  name.textContent = role === 'user' ? '你' : '伯乐识果 · ' + model;
  const meta = document.createElement('div');
  meta.className = 'message-meta';
  const now = new Date();
  const time = document.createElement('time');
  time.dateTime = now.toISOString();
  time.textContent = new Intl.DateTimeFormat('zh-CN', {hour:'2-digit', minute:'2-digit', hour12:false}).format(now);
  if (role === 'assistant') {
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.setAttribute('aria-hidden', 'true');
    meta.append(name, dot);
  }
  meta.append(time);
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  const text = document.createElement('p');
  text.textContent = content;
  bubble.append(text);
  if (role === 'user') card.append(bubble, meta);
  else card.append(meta, bubble);
  if (sources.length) {
    const label = document.createElement('small');
    label.textContent = '本轮检索到的资料';
    const list = document.createElement('ul');
    for (const source of sources) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = source.id + ' · ' + source.title;
      item.append(link);
      list.append(item);
    }
    bubble.append(label, list);
  }
  conversation.append(card);
  return card;
}

let firstCard;
function openConversation(firstQuestion) {
  const panel = document.querySelector('#homeConversation');
  if (panel) panel.hidden = false;
  firstCard?.remove();
  question.value = firstQuestion;
  firstCard = show('user', firstQuestion);
  status.textContent = '输入评审口令后，发送这条消息。';
  if (password.value) form.requestSubmit();
  else password.focus({preventScroll:true});
  if (panel) panel.scrollIntoView({block:'start'});
}
window.BoleChat = {open:openConversation};
const firstQuestion = sessionStorage.getItem('bole:first-question');
if (firstQuestion) {
  sessionStorage.removeItem('bole:first-question');
  openConversation(firstQuestion);
}

document.querySelectorAll('[data-prompt]').forEach(button => {
  button.addEventListener('click', () => {
    question.value = button.dataset.prompt;
    question.focus();
  });
});
reset.addEventListener('click', () => {
  history.length = 0;
  conversation.replaceChildren();
  firstCard = undefined;
  status.textContent = '';
  question.value = '';
  question.focus();
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  const content = question.value.trim();
  if (!content || send.disabled) return;
  send.disabled = reset.disabled = question.readOnly = true;
  status.textContent = '正在检索资料并分析…';
  firstCard?.remove();
  firstCard = undefined;
  const pending = show('user', content);
  try {
    const credential = Array.from(new TextEncoder().encode('reviewer:' + password.value), byte => String.fromCharCode(byte)).join('');
    const endpoint = window.BOLE_AGENT_ENDPOINT;
    if (!endpoint && location.hostname.endsWith('.github.io')) {
      throw new Error('评审服务正在配置，请稍后再试。');
    }
    const response = await fetch(endpoint || '../api/agent', {
      method: 'POST',
      headers: {'Content-Type':'application/json', Authorization:'Basic ' + btoa(credential)},
      body: JSON.stringify({messages:[...history.slice(-8), {role:'user',content}]}),
      signal: AbortSignal.timeout(65000)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || typeof result.answer !== 'string') {
      throw new Error(result.error || '无法连接智能体服务，请使用正式评审链接。');
    }
    show('assistant', result.answer, result.model, result.sources);
    history.push({role:'user',content}, {role:'assistant',content:result.answer.slice(0, 8000)});
    question.value = '';
    status.textContent = '可以继续追问。';
  } catch (error) {
    pending.remove();
    status.textContent = error.name === 'TimeoutError' ? '请求超时，请重试。' : error.message;
  } finally {
    send.disabled = reset.disabled = question.readOnly = false;
  }
});

})();
