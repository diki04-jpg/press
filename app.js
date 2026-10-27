'use strict';
// 스타터 데이터.js의 보도자료 배열을 그대로 사용합니다. 서버 및 fetch 불필요.
const data = (typeof 보도자료 !== 'undefined' && Array.isArray(보도자료)) ? 보도자료 : [];
const q = document.getElementById('q');
const list = document.getElementById('list');
const count = document.getElementById('count');
const filters = document.getElementById('filters');
const clear = document.getElementById('clear');
let currentAgency = '전체';
const agencies = ['전체', ...new Set(data.map(item => String(item.부처 || '')))];

function makeElement(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

function renderFilters() {
  filters.replaceChildren();
  agencies.forEach(agency => {
    const btn = makeElement('button', 'chip', agency === '전체' ? '전체 부처' : agency);
    btn.type = 'button';
    btn.setAttribute('aria-pressed', String(currentAgency === agency));
    btn.addEventListener('click', () => {
      currentAgency = agency;
      renderFilters();
      update();
    });
    filters.append(btn);
  });
}

function cleanPreview(body) {
  return body.replace(/^#\s+[^\n]+\n+/, '').replace(/\*\*/g, '').replace(/\n+---\s*$/, '').trim();
}

function render(arr) {
  count.textContent = `결과 ${arr.length}건`;
  list.replaceChildren();
  if (!arr.length) {
    const empty = makeElement('div', 'empty');
    empty.append(makeElement('strong', '', '검색 결과가 없습니다.'), makeElement('span', '', '검색어 또는 부처 필터를 변경해 주세요.'));
    list.append(empty);
    return;
  }
  arr.forEach(a => {
    const card = makeElement('article', 'card');
    const top = makeElement('div', 'card-top');
    top.append(makeElement('span', 'label', a.부처), makeElement('span', 'card-index', `자료 ${a.번호 || ''}`));
    const heading = makeElement('h3', 'title', a.제목);
    const body = String(a.본문 || '');
    const preview = cleanPreview(body);
    const summary = makeElement('p', 'body-preview', preview.slice(0, 210) + (preview.length > 210 ? '…' : ''));
    const btn = makeElement('button', 'view-btn', '원문 전체 보기 ＋');
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    const full = makeElement('div', 'fullbody', body);
    full.hidden = true;
    btn.addEventListener('click', () => {
      full.hidden = !full.hidden;
      btn.setAttribute('aria-expanded', String(!full.hidden));
      btn.textContent = full.hidden ? '원문 전체 보기 ＋' : '원문 접기 －';
    });
    card.append(top, heading, summary, btn, full);
    list.append(card);
  });
}

function update() {
  const keyword = q.value.trim().toLocaleLowerCase('ko-KR');
  const matched = data.filter(a => {
    const agencyMatches = currentAgency === '전체' || a.부처 === currentAgency;
    const keywordMatches = !keyword || [a.제목, a.본문, a.부처].some(value => String(value || '').toLocaleLowerCase('ko-KR').includes(keyword));
    return agencyMatches && keywordMatches;
  });
  render(matched);
}
q.addEventListener('input', update);
clear.addEventListener('click', () => {
  q.value = '';
  currentAgency = '전체';
  renderFilters();
  update();
  q.focus();
});
renderFilters();
update();
