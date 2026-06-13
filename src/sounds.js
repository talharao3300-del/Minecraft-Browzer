// Procedural sounds via WebAudio (no asset files needed)
const Sound = {
  ctx: null, muted: false,
  init(){
    if (!this.ctx){
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  play(freq, dur, type, vol, slide){
    if (this.muted || !this.ctx) return;
    try {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type || 'square';
      o.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (slide) o.frequency.linearRampToValueAtTime(Math.max(20, freq + slide), this.ctx.currentTime + dur);
      g.gain.setValueAtTime(vol || 0.12, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(); o.stop(this.ctx.currentTime + dur);
    } catch (e) {}
  },
  breakBlock(){ this.play(220, 0.12, 'square', 0.12, -60); },
  place(){ this.play(330, 0.1, 'square', 0.12, 40); },
  hurt(){ this.play(140, 0.25, 'sawtooth', 0.2, -50); },
  eat(){ this.play(440, 0.07, 'square', 0.12); setTimeout(() => this.play(520, 0.07, 'square', 0.12), 90); },
  craft(){ this.play(660, 0.12, 'triangle', 0.15, 120); },
  hit(){ this.play(180, 0.1, 'sawtooth', 0.15, -40); },
  explode(){ this.play(60, 0.6, 'sawtooth', 0.35, -35); this.play(45, 0.8, 'square', 0.25, -20); },
  baa(){ this.play(500, 0.25, 'triangle', 0.1, -90); },
  moo(){ this.play(220, 0.4, 'triangle', 0.1, -70); },
  deny(){ this.play(120, 0.15, 'square', 0.1); },
  bow(){ this.play(380, 0.12, 'triangle', 0.12, -180); },
  pop(){ this.play(600, 0.08, 'square', 0.12, 250); },
};
