# AgriVinka — Component Usage Rules

## Import Path
```jsx
import { Button, Input, Card, Badge, Modal, Tabs, Select } from '@/components/ui';
```

---

## Button
| Variant | When to use |
|---------|-------------|
| `primary` | Main action: submit, save, enroll |
| `secondary` | Secondary action: back, cancel (dark) |
| `accent` | CTA / promotional: hero buttons |
| `ghost` | Tertiary: dismiss, less important actions |
| `outline` | Neutral bordered: filters, toggles |
| `danger` | Destructive: delete, revoke |
| `link` | Inline text action |

```jsx
<Button variant="primary" size="md">احفظ</Button>
<Button variant="danger" size="sm" loading>جاري الحذف</Button>
<Button variant="ghost" icon={<FiSettings />}>إعدادات</Button>
```

**Sizes:** `sm` (32px), `md` (40px), `lg` (48px), `xl` (56px)

---

## Input / Select
```jsx
<Input label="البريد الإلكتروني" error="مطلوب" />
<Select label="الفئة" options={[...]} placeholder="اختر" />
```

- Always provide `label` for accessibility
- Use `error` prop (not red border classes) for validation
- Use `helperText` for hints below the input

---

## Card
| Variant | When to use |
|---------|-------------|
| `default` | Static content cards |
| `elevated` | Featured / highlighted cards |
| `interactive` | Clickable cards (hover lift) |
| `outlined` | Bordered emphasis without fill |
| `flat` | Subtle background sections |

```jsx
<Card variant="interactive" padding="md">
  <Card.Header><h3>عنوان</h3></Card.Header>
  <Card.Body>محتوى</Card.Body>
  <Card.Footer><Button size="sm">عرض</Button></Card.Footer>
</Card>
```

---

## Badge
```jsx
<Badge variant="success">مفعّل</Badge>
<Badge variant="danger" size="sm">محذوف</Badge>
<Badge variant="warning">معلق</Badge>
```

Map DB statuses to variants: `approved` → `success`, `pending` → `warning`, `rejected` → `danger`

---

## Modal
```jsx
<Modal open={isOpen} onClose={() => setIsOpen(false)} title="تأكيد">
  <p>هل أنت متأكد؟</p>
  <Modal.Footer>
    <Button variant="ghost" onClick={() => setIsOpen(false)}>إلغاء</Button>
    <Button variant="danger">حذف</Button>
  </Modal.Footer>
</Modal>
```

- Always provide `title` for screen readers
- Closes on Escape + backdrop click automatically
- Uses focus trap

---

## Tabs
```jsx
<Tabs
  tabs={[
    { id: 'all', label: 'الكل', count: 12 },
    { id: 'active', label: 'نشط' },
  ]}
  activeTab={tab}
  onChange={setTab}
  variant="pills"  // or "underline" | "buttons"
/>
```

- Arrow keys cycle tabs (RTL-aware)
- Use `count` for showing item counts

---

## ❌ Don'ts
1. **Don't inline button styles** — Use `<Button>` instead of `<button className="bg-primary ...">`
2. **Don't create one-off card wrappers** — Use `<Card variant="...">` 
3. **Don't mix CSS `.btn-primary` with `<Button>`** — Pick one (prefer React component)
4. **Don't hardcode colors** — Use token names: `text-primary`, `bg-danger-light`
5. **Don't skip labels on inputs** — Bad for accessibility

## ✅ Do's
1. Use `variant` prop to control appearance — not className overrides
2. Use `className` prop for layout (margins, width) only
3. Wrap pages in existing `<PageShell>` for consistent padding
4. Use `<Badge>` for all status labels across admin and user dashboard
