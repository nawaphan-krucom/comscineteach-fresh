#!/usr/bin/env node
const playwright = require('playwright');
(async () => {
  const url = process.argv[2] || 'http://localhost:5174/';
  console.log('Checking', url);
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message, '\n', err.stack));
  page.on('requestfailed', req => {
    try {
      const res = req.response();
      console.log('REQUEST FAILED:', req.url(), res ? res.status() : 'no response', req.failure() ? req.failure().errorText : '');
    } catch (e) {
      console.log('REQUEST FAILED (error reading):', req.url());
    }
  });
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle' , timeout: 10000});
    console.log('status', resp && resp.status());
    const title = await page.title();
    console.log('title:', title);
    const html = await page.content();
    console.log('----PAGE HTML START----');
    console.log(html.substring(0, 2000));
    console.log('----PAGE HTML END----');
    await page.screenshot({ path: 'page_screenshot.png', fullPage: true });
    console.log('Saved screenshot page_screenshot.png');
  } catch (err) {
    console.error('Navigation error:', err && err.message);
  } finally {
    await browser.close();
  }
})();
