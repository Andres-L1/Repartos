import { useId } from 'react';
import '../why.css';

/** «Por qué»: el texto lo genera src/pedagogy/why.ts con hechos de la posición. Sin texto no se pinta nada. Quien lo monta decide cuándo (nunca antes de ver la solución). */
export function WhyBlock({ text }: { text: string | null }) {
  const id = useId();
  if (!text) return null;
  return (
    <section className="why" aria-labelledby={id}>
      <h3 className="why-title" id={id}>
        Por qué
      </h3>
      <p className="why-text">{text}</p>
    </section>
  );
}
