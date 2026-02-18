import React from 'react';
import UnitHero from '../components/UnitHero';

describe('UnitHero', () => {
  it('creates the correct React element shape for props', () => {
    const el = UnitHero({ unitNumber: 9, badge: <div>Badge</div>, title: <span>หัวข้อทดสอบ</span>, subtitle: 'คำอธิบายสั้น', divider: true } as any) as React.ReactElement;

    // root element type and props
    expect(el.type).toBe('section');
    expect(el.props.children).toBeDefined();

    // shallow verify presence of provided pieces inside children
    const childrenStr = JSON.stringify(el.props.children);
    expect(childrenStr).toContain('Badge');
    expect(childrenStr).toContain('หน่วยการเรียนรู้ที่');
    expect(childrenStr).toContain('9');
    expect(childrenStr).toContain('หัวข้อทดสอบ');
    expect(childrenStr).toContain('คำอธิบายสั้น');
  });

  it('shallow snapshot matches (UnitHero)', () => {
    const el = UnitHero({ unitNumber: 2, title: <span>หัวข้อตัวอย่าง</span>, subtitle: 'ย่อหน้า', divider: true } as any) as React.ReactElement;
    expect(el).toMatchSnapshot();
  });
});
