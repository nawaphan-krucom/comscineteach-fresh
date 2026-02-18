import React from 'react';
import PillTabs from '../components/PillTabs';

describe('PillTabs', () => {
  it('creates buttons with correct classnames and onClick props', () => {
    const onChange = jest.fn();
    const el = PillTabs({ items: [{ id: 0, label: 'หนึ่ง' }, { id: 1, label: 'สอง' }], active: 0, onChange, activeClassName: 'active-test', inactiveClassName: 'inactive-test' } as any) as React.ReactElement;

    expect(el.type).toBe('div');
    const children = React.Children.toArray(el.props.children) as React.ReactElement[];
    const firstBtn = children[0];
    const secondBtn = children[1];

    expect(firstBtn.props.className).toContain('active-test');
    expect(secondBtn.props.className).toContain('inactive-test');
    expect(typeof firstBtn.props.onClick).toBe('function');

    // simulate calling onClick prop directly
    secondBtn.props.onClick();
    expect(onChange).toHaveBeenCalledWith(1);
  });
});
