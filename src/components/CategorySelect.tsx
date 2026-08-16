export type CategoryOption = {
  id: string;
  name: string;
  parentName: string | null;
};

// Współdzielony <select> kategorii — kategorie z podkategoriami renderują się
// jako <optgroup> (podkategorie pod nagłówkiem grupy), reszta jako zwykłe opcje.
// `placeholder` bez `required` to realna, wybieralna opcja "wszystkie" (filtr);
// z `required` to wyszarzona opcja zachęcająca do wyboru (formularz dodawania).
export function CategorySelect({
  name = "category",
  categories,
  defaultValue,
  placeholder,
  required,
  className,
}: {
  name?: string;
  categories: CategoryOption[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  const topLevel = categories.filter((c) => !c.parentName);
  const childrenOf = (parentName: string) =>
    categories.filter((c) => c.parentName === parentName);

  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ""}
      required={required}
      className={className}
    >
      {placeholder !== undefined && (
        <option value="" disabled={required}>
          {placeholder}
        </option>
      )}
      {topLevel.map((cat) => {
        const children = childrenOf(cat.name);
        if (children.length === 0) {
          return (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          );
        }
        return (
          <optgroup key={cat.id} label={cat.name}>
            <option value={cat.name}>{cat.name} (ogólne)</option>
            {children.map((child) => (
              <option key={child.id} value={child.name}>
                {child.name}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}
