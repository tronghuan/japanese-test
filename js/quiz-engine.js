/**
 * ============================================
 * JAPANESE QUIZ ENGINE — Shared Logic
 * Dùng chung cho tất cả bài quiz N5 → N1
 * ============================================
 *
 * CÁCH SỬ DỤNG:
 * 1. Trong file HTML, định nghĩa biến QUIZ_CONFIG trước khi load script này:
 *
 *    const QUIZ_CONFIG = {
 *      questions: [ ... ],        // Mảng câu hỏi (bắt buộc)
 *      backUrl: "../index.html",   // Link quay về trang chủ (tuỳ chọn)
 *      backLabel: "← Quay về"      // Text nút quay về (tuỳ chọn)
 *    };
 *
 * 2. Mỗi câu hỏi có cấu trúc:
 *    {
 *      tag: "NGỮ PHÁP • N2",
 *      text: "Câu hỏi có ______ chỗ trống.",
 *      vocab: [
 *        { word: "漢字", reading: "かんじ", type: "Danh từ", meaning: "Chữ Hán",
 *          example: "漢字を書く。\n(Viết chữ Hán.)" }
 *      ],
 *      choices: ["A", "B", "C", "D"],
 *      answer: 0,  // index đáp án đúng (0-based)
 *      explanation: "HTML giải thích..."
 *    }
 */

(function () {
  'use strict';

  // ── Read config ──
  const config = window.QUIZ_CONFIG;
  if (!config || !config.questions || !config.questions.length) {
    console.error('QUIZ_CONFIG is missing or has no questions.');
    return;
  }

  const QUESTIONS = config.questions;
  const LETTERS = ['A', 'B', 'C', 'D'];
  const NEXT_SVG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';

  let current = 0;
  let score = 0;
  let answered = false;
  let expVisible = false;

  // ── Cache DOM ──
  const $ = (id) => document.getElementById(id);
  const progressFill = $('progressFill');
  const progressText = $('progressText');
  const scoreBadge   = $('scoreBadge');
  const qNum         = $('qNum');
  const qTag         = $('qTag');
  const qText        = $('qText');
  const vocabStrip   = $('vocabStrip');
  const choicesEl    = $('choices');
  const explanation  = $('explanation');
  const expToggle    = $('expToggle');
  const nextBtn      = $('nextBtn');
  const expBody      = $('expBody');
  const quizCard     = $('quizCard');
  const progressWrap = $('progressWrap');
  const resultScreen = $('resultScreen');
  const vocabPopup   = $('vocabPopup');

  // ── Render question ──
  function renderQuestion() {
    const q = QUESTIONS[current];
    answered = false;
    expVisible = false;

    progressFill.style.width = (current / QUESTIONS.length * 100) + '%';
    progressText.textContent = `${current + 1} / ${QUESTIONS.length}`;
    scoreBadge.textContent = score + ' điểm';

    qNum.textContent = `Q${current + 1}`;
    qTag.textContent = q.tag;
    qText.innerHTML = q.text.replace(/\n/g, '<br>');

    // Vocab chips
    vocabStrip.innerHTML = '<span class="vocab-label">🔍 TRA TỪ:</span>';
    q.vocab.forEach(function (v, i) {
      var chip = document.createElement('button');
      chip.className = 'vocab-chip';
      chip.textContent = v.word;
      chip.onclick = function () { showVocab(i); };
      vocabStrip.appendChild(chip);
    });

    // Choices
    choicesEl.innerHTML = '';
    q.choices.forEach(function (c, i) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = '<span class="choice-letter">' + LETTERS[i] + '</span><span>' + c + '</span>';
      btn.onclick = function () { selectAnswer(i); };
      choicesEl.appendChild(btn);
    });

    // Reset panels
    explanation.classList.remove('show');
    expToggle.classList.remove('show');
    nextBtn.classList.remove('show');
    expBody.innerHTML = q.explanation;

    // Animate
    quizCard.style.animation = 'none';
    quizCard.offsetHeight; // reflow
    quizCard.style.animation = 'slideUp 0.4s cubic-bezier(.4,0,.2,1)';
  }

  // ── Select answer ──
  function selectAnswer(idx) {
    if (answered) return;
    answered = true;
    var q = QUESTIONS[current];
    var btns = document.querySelectorAll('.choice-btn');

    btns.forEach(function (btn, i) {
      btn.disabled = true;
      if (i === q.answer) btn.classList.add('correct');
      if (i === idx && idx !== q.answer) btn.classList.add('wrong');
    });

    if (idx === q.answer) {
      score++;
      showToast('✓ Chính xác!', 'ok');
    } else {
      showToast('✗ Sai rồi!', 'ng');
    }

    expToggle.classList.add('show');
    nextBtn.classList.add('show');
    if (current === QUESTIONS.length - 1) {
      nextBtn.innerHTML = 'Xem kết quả ' + NEXT_SVG;
    }
  }

  // ── Toggle explanation ──
  function toggleExp() {
    expVisible = !expVisible;
    if (expVisible) {
      explanation.classList.add('show');
      expToggle.textContent = '📕 Ẩn giải thích';
    } else {
      explanation.classList.remove('show');
      expToggle.textContent = '📖 Xem giải thích';
    }
  }

  // ── Next question ──
  function nextQuestion() {
    current++;
    if (current >= QUESTIONS.length) {
      showResult();
    } else {
      renderQuestion();
    }
  }

  // ── Show result ──
  function showResult() {
    quizCard.style.display = 'none';
    progressWrap.style.display = 'none';

    var pct = score / QUESTIONS.length;
    var kanji = '合格', title = 'Xuất sắc!', sub = 'Bạn thật sự giỏi tiếng Nhật!';
    if (pct < 0.5) {
      kanji = '不合格'; title = 'Cần cố gắng thêm'; sub = 'Hãy ôn luyện lại nhé!';
    } else if (pct < 0.8) {
      kanji = '合格'; title = 'Khá tốt!'; sub = 'Tiếp tục luyện tập nhé!';
    }

    $('resultKanji').textContent = kanji;
    $('resultTitle').textContent = title;
    $('resultSub').textContent = sub;
    $('resultScore').innerHTML = score + '<span>/' + QUESTIONS.length + '</span>';

    resultScreen.classList.add('show');
  }

  // ── Restart ──
  function restart() {
    current = 0; score = 0; answered = false; expVisible = false;
    quizCard.style.display = '';
    progressWrap.style.display = '';
    resultScreen.classList.remove('show');
    nextBtn.innerHTML = 'Câu tiếp theo ' + NEXT_SVG;
    renderQuestion();
  }

  // ── Vocab popup ──
  function showVocab(idx) {
    var v = QUESTIONS[current].vocab[idx];
    $('vpWord').textContent = v.word;
    $('vpReading').textContent = v.reading;
    $('vpType').textContent = v.type;
    $('vpMeaning').textContent = v.meaning;
    var lines = v.example.split('\n');
    $('vpExample').innerHTML = lines[0] + (lines[1] ? '<em>' + lines[1] + '</em>' : '');
    vocabPopup.classList.add('open');
  }

  function closeVocab(e) {
    if (e.target === vocabPopup) vocabPopup.classList.remove('open');
  }

  function closeVocabBtn() {
    vocabPopup.classList.remove('open');
  }

  // ── Toast ──
  var toastTimer;
  function showToast(msg, type) {
    var t = $('toast');
    t.textContent = msg;
    t.className = 'toast show ' + type;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  // ── Expose to HTML onclick handlers ──
  window.toggleExp = toggleExp;
  window.nextQuestion = nextQuestion;
  window.restart = restart;
  window.closeVocab = closeVocab;
  window.closeVocabBtn = closeVocabBtn;

  // ── Init ──
  renderQuestion();
})();
