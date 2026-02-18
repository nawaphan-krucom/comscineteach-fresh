import React from 'react';

export default function LoginPrototype(): JSX.Element {
  return (
    <div className="login-proto-root">
      <div className="login-card">
        <div className="status-badge">📶 Online (Firebase)</div>

        <div className="brand">
          <div className="brand-icon" aria-hidden>
            <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="10" width="44" height="36" rx="10" fill="url(#g)" />
              <rect x="16" y="20" width="28" height="18" rx="6" fill="rgba(255,255,255,0.4)" />
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0" stopColor="#7c3aed" />
                  <stop offset="1" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>เข้าสู่ระบบ</h1>
          <p className="subtitle">ยินดีต้อนรับสู่ห้องเรียนคอมพิวเตอร์</p>
        </div>

        <form className="login-form" onSubmit={e => e.preventDefault()}>
          <label className="field-label">ชื่อผู้ใช้ / รหัสประจำตัวนักเรียน</label>
          <div className="input-wrap">
            <span className="input-icon">👤</span>
            <input className="input" placeholder="เช่น 66001 หรือ teacher" aria-label="username" />
          </div>

          <label className="field-label">รหัสผ่าน</label>
          <div className="input-wrap">
            <span className="input-icon">🔒</span>
            <input type="password" className="input" placeholder="รหัสผ่าน" aria-label="password" />
            <button type="button" className="eye" aria-label="toggle password visibility">👁️</button>
          </div>

          <div className="forgot"><a href="#">ลืมรหัสผ่าน?</a></div>

          <button className="cta" type="submit">🔑&nbsp;&nbsp;เข้าสู่ระบบ</button>

          <div className="links">
            <a className="muted" href="#">นักเรียนใหม่? ลงทะเบียนที่นี่ →</a>
            <a className="accent" href="#">มีรหัสเช็ต? ใช้ที่นี่ 🔑</a>
          </div>
        </form>

      </div>
    </div>
  );
}
