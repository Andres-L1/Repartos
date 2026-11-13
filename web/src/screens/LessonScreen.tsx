import { useEffect, useState } from 'react';
import type { Lesson } from '../../../src/content/schema';
import { api, ApiError } from '../api';
import { LessonPlayer } from '../components/LessonPlayer';
import { navigate } from '../router';

export function LessonScreen({ id }: { id: string }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    setLesson(null);
    setError('');
    api
      .lesson(id)
      .then((r) => setLesson(r.lesson))
      .catch((e) => {
        // 401 y 402 los gestiona la capa de API (redirección)
        if (e instanceof ApiError && (e.status === 401 || e.status === 402)) return;
        setError(e instanceof ApiError ? e.message : 'No se pudo cargar la lección.');
      });
  }, [id]);

  if (error)
    return (
      <div className="card" role="alert">
        <p>{error}</p>
        <button className="btn" onClick={() => navigate('/mapa')}>
          Volver al mapa
        </button>
      </div>
    );
  if (!lesson) return <p role="status">Cargando lección…</p>;
  return <LessonPlayer key={lesson.id} lesson={lesson} />;
}
