import React from 'react';
import { Button } from './primitives/Button';
import { Input } from './primitives/Input';
import { Card } from './primitives/Card';

export const ThemePlayground: React.FC = () => {
  return (
    <div data-testid="theme-playground" style={{ padding: 24 }}>
      <h3 className="font-bold text-lg mb-4">Theme prototype — playground</h3>
      <div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
        <Card>
          <p className="text-sm text-slate-600 mb-3">Primary button / input / card preview</p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button>Primary action</Button>
            <Button variant="ghost">Ghost</Button>
            <Input placeholder="ตัวอย่างอินพุต" />
          </div>
        </Card>
        <Card>
          <p className="text-sm text-slate-600">Use query string <code>?themeDemo=1</code> to open this playground locally.</p>
        </Card>
      </div>
    </div>
  );
};

export default ThemePlayground;
