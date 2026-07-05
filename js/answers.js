/* ============================================
   JLPT ANSWER KEY — download code-verification flow
   Expects window.DOWNLOAD_LINKS = { listening: "...", reading: "..." }
   ============================================ */
(function () {
  var CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid confusion
  var CODE_WAIT_SECONDS = 15;

  var state = {
    part: null,
    generatedCode: null,
    timerInterval: null
  };

  function el(id) { return document.getElementById(id); }

  function generateCode() {
    var code = '';
    for (var i = 0; i < 6; i++) {
      code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    return code;
  }

  function resetModalUI() {
    clearInterval(state.timerInterval);
    state.generatedCode = null;
    el('dlCodeInput').value = '';
    el('dlGetCodeBtn').disabled = false;
    el('dlGetCodeBtn').textContent = 'Lấy mã';
    el('dlCodeDisplay').classList.remove('active');
    el('dlTimer').textContent = '';
  }

  window.openDownloadModal = function (part) {
    state.part = part;
    el('dlError').textContent = '';
    resetModalUI();
    var label = part === 'listening' ? 'Phần Nghe' : 'Phần Đọc';
    el('dlModalTitle').textContent = 'Tải xuống — ' + label;
    el('dlModalOverlay').classList.add('active');
  };

  window.closeDownloadModal = function () {
    el('dlModalOverlay').classList.remove('active');
    resetModalUI();
    el('dlError').textContent = '';
  };

  window.requestDownloadCode = function () {
    if (state.timerInterval) return;
    state.generatedCode = generateCode();
    el('dlGetCodeBtn').disabled = true;
    el('dlError').textContent = '';
    var remaining = CODE_WAIT_SECONDS;
    el('dlTimer').textContent = 'Đang lấy mã... ' + remaining + 's';
    state.timerInterval = setInterval(function () {
      remaining--;
      if (remaining <= 0) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        el('dlTimer').textContent = '';
        el('dlCodeDisplay').classList.add('active');
        el('dlGeneratedCode').textContent = state.generatedCode;
      } else {
        el('dlTimer').textContent = 'Đang lấy mã... ' + remaining + 's';
      }
    }, 1000);
  };

  window.confirmDownloadCode = function () {
    var input = el('dlCodeInput').value.trim().toUpperCase();
    var ok = state.generatedCode && input.length === 6 && input === state.generatedCode;
    if (!ok) {
      resetModalUI();
      el('dlError').textContent = '❌ Mã không đúng. Vui lòng bấm "Lấy mã" để thử lại từ đầu.';
      return;
    }
    var links = window.DOWNLOAD_LINKS || {};
    var url = links[state.part];
    if (url) window.location.href = url;
  };

  document.addEventListener('DOMContentLoaded', function () {
    var input = el('dlCodeInput');
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') window.confirmDownloadCode();
      });
    }
  });
})();
