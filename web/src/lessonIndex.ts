import index from 'virtual:concept-lessons';

/** Lecciones (id y título) que trabajan un concepto. Sin el temario completo en el JS de la web. */
export const lessonsForConcept = (conceptId: string): { id: string; title: string }[] => index[conceptId] ?? [];
