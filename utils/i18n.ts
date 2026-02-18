export type Locale = 'th' | 'en';

const MESSAGES: Record<Locale, Record<string, string>> = {
  th: {
    manage_classroom: 'จัดการห้องเรียน',
    class_overview: 'ดูแลนักเรียน: {students} คน | บทเรียน: {units} หน่วย',
    online: 'Online',
    offline: 'Offline',
    auth_session: 'Auth session',
    student_list: 'รายชื่อนักเรียน',
    view_as_student: 'ดูมุมมองนักเรียน',
    add_student: 'เพิ่มนักเรียนใหม่',
    search_placeholder: 'ค้นหาชื่อ...',
    import_csv: 'นำเข้าจาก CSV',
  },
  en: {
    manage_classroom: 'Manage classroom',
    class_overview: 'Students: {students} · Units: {units}',
    online: 'Online',
    offline: 'Offline',
    auth_session: 'Auth session',
    student_list: 'Student list',
    view_as_student: 'View as student',
    add_student: 'Add student',
    search_placeholder: 'Search name...',
    import_csv: 'Import from CSV',
  },
};

export const getSavedLocale = (): Locale => {
  try {
    const v = localStorage.getItem('locale');
    if (v === 'en') return 'en';
  } catch {
    /* ignore */
  }
  return 'th';
};

export const t = (key: string, vars?: Record<string, string | number>, locale?: Locale) => {
  const loc = locale || getSavedLocale();
  const msg = MESSAGES[loc][key] || MESSAGES['th'][key] || key;
  if (!vars) return msg;
  return Object.keys(vars).reduce((s, k) => s.replace(`{${k}}`, String(vars[k])), msg);
};

export const setLocale = (loc: Locale) => {
  try {
    localStorage.setItem('locale', loc);
  } catch {
    /* ignore */
  }
};

export default { t, setLocale, getSavedLocale };
