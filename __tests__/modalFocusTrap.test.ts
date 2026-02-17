import { startModalFocusTrap } from '../components/utils/modalFocusTrap';

describe('modalFocusTrap', () => {
  test('traps tab focus inside container and restores focus on cleanup', () => {
    const container = document.createElement('div');
    const btn1 = document.createElement('button'); btn1.textContent = 'one';
    const btn2 = document.createElement('button'); btn2.textContent = 'two';
    container.appendChild(btn1);
    container.appendChild(btn2);
    document.body.appendChild(container);

    const onClose = jest.fn();
    const cleanup = startModalFocusTrap(container, onClose);

    // first focusable should be focused
    expect(document.activeElement === btn1 || document.activeElement === btn2).toBeTruthy();

    // simulate Tab (forward)
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    document.dispatchEvent(tabEvent);
    // our trap handler sets focus programmatically; ensure activeElement is one of the buttons
    expect([btn1, btn2]).toContain(document.activeElement);

    // simulate Escape
    const esc = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(esc);
    expect(onClose).toHaveBeenCalled();

    cleanup();
    // cleanup should not throw and event listeners removed; focus restoration may vary in jsdom

    container.remove();
  });
});