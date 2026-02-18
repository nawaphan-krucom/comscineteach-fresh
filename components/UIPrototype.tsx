import React, { useState } from 'react';

const tabs = ['Home', 'Dashboard', 'Gradebook'] as const;

type Tab = typeof tabs[number];

export default function UIPrototype(): JSX.Element {
  const [active, setActive] = useState<Tab>('Home');

  return (
    <div className="ui-prototype-root">
      <header className="proto-header">
        <div className="proto-brand">ComSciTeach — UI Prototype</div>
        <nav className="proto-nav">
          {tabs.map(t => (
            <button
              key={t}
              className={`proto-nav-btn ${t === active ? 'active' : ''}`}
              onClick={() => setActive(t)}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      <main className="proto-main">
        {active === 'Home' && (
          <section className="proto-grid">
            <article className="proto-card large">
              <h3>Welcome back</h3>
              <p className="muted">Overview of recent activity and next steps.</p>
              <div className="card-row">
                <div className="stat">
                  <div className="num">8</div>
                  <div className="label">New Tasks</div>
                </div>
                <div className="stat">
                  <div className="num">3</div>
                  <div className="label">Pending Reviews</div>
                </div>
                <div className="stat">
                  <div className="num">92%</div>
                  <div className="label">Course Completion</div>
                </div>
              </div>
            </article>

            <article className="proto-card">
              <h4>Quick Actions</h4>
              <div className="action-grid">
                <button className="action">Create Assignment</button>
                <button className="action">Export Gradebook</button>
                <button className="action">Send Announcement</button>
              </div>
            </article>

            <article className="proto-card small">
              <h4>Upcoming</h4>
              <ul className="muted">
                <li>Quiz 3 — Tomorrow</li>
                <li>Project due — Fri</li>
                <li>Parent meeting — Mon</li>
              </ul>
            </article>
          </section>
        )}

        {active === 'Dashboard' && (
          <section className="proto-grid dashboard">
            <article className="proto-card">
              <h4>Class Performance</h4>
              <p className="muted">Average score and distribution</p>
              <div className="chart-placeholder">[chart]</div>
            </article>

            <article className="proto-card">
              <h4>Top Students</h4>
              <ol>
                <li>Alice — 98%</li>
                <li>Bob — 95%</li>
                <li>Charlie — 93%</li>
              </ol>
            </article>

            <article className="proto-card">
              <h4>Engagement</h4>
              <p className="muted">Active students last 7 days</p>
              <div className="metric">72%</div>
            </article>
          </section>
        )}

        {active === 'Gradebook' && (
          <section className="proto-grid gradebook">
            <article className="proto-card full">
              <h4>Gradebook (sample)</h4>
              <table className="proto-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Assignment 1</th>
                    <th>Quiz 1</th>
                    <th>Avg</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>66001 — Narong</td>
                    <td>92</td>
                    <td>88</td>
                    <td>90</td>
                  </tr>
                  <tr>
                    <td>66002 — Somchai</td>
                    <td>78</td>
                    <td>82</td>
                    <td>80</td>
                  </tr>
                  <tr>
                    <td>66003 — Mali</td>
                    <td>85</td>
                    <td>87</td>
                    <td>86</td>
                  </tr>
                </tbody>
              </table>
              <div className="proto-card-actions">
                <button className="primary">Export</button>
                <button>Adjust Weights</button>
              </div>
            </article>
          </section>
        )}
      </main>

      <footer className="proto-footer muted">Prototype — Modern minimalist design tokens</footer>
    </div>
  );
}
