(function () {
  function norm(s) {
    return (s || "").replace(/\s+/g, " ").trim();
  }

  function getReadableText() {
    const card = document.querySelector(".card");
    if (!card) return "";

    const title = norm(card.querySelector(".h1")?.textContent);
    const coords = norm(card.querySelector(".small")?.textContent);

    const ps = Array.from(card.querySelectorAll(".p"))
      .map((p) => norm(p.textContent))
      .filter(Boolean);

    // cím + koordináta + bekezdések
    return [title, coords, ...ps].filter(Boolean).join(". ");
  }

  function pickHungarianVoice(utt) {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices ? synth.getVoices() : [];
    const hu = voices.find((v) => (v.lang || "").toLowerCase().startsWith("hu"));

    if (hu) utt.voice = hu;
    utt.lang = hu?.lang || "hu-HU";
  }

  function setPlayLabel() {
    const btn = document.getElementById("ttsPlay");
    if (!btn) return;

    const synth = window.speechSynthesis;
    if (synth && synth.speaking) {
      btn.textContent = synth.paused ? "▶️ Folytatás" : "⏸️ Szünet";
    } else {
      btn.textContent = "🔊 Felolvasás";
    }
  }

  function onPlayClick(e) {
    e.preventDefault();

    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      alert("Ezen a böngészőn nincs beépített felolvasás.");
      return;
    }

    const synth = window.speechSynthesis;

    // ha már megy, akkor a Play gomb szünet / folytatás
    if (synth.speaking) {
      if (synth.paused) synth.resume();
      else synth.pause();
      setPlayLabel();
      return;
    }

    const text = getReadableText();
    if (!text) {
      alert("Nincs felolvasható szöveg ezen az oldalon.");
      return;
    }

    const utt = new SpeechSynthesisUtterance(text);
    pickHungarianVoice(utt);

    utt.onend = setPlayLabel;
    utt.onerror = setPlayLabel;

    synth.cancel(); // biztos tiszta indulás
    synth.speak(utt);
    setPlayLabel();
  }

  function onStopClick(e) {
    e.preventDefault();
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setPlayLabel();
  }

  function wire() {
    const play = document.getElementById("ttsPlay");
    const stop = document.getElementById("ttsStop");

    if (play) play.addEventListener("click", onPlayClick);
    if (stop) stop.addEventListener("click", onStopClick);

    if ("speechSynthesis" in window) {
      // hangok sokszor később töltődnek be
      window.speechSynthesis.onvoiceschanged = setPlayLabel;
    }

    setPlayLabel();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
