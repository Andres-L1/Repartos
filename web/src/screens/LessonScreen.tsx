import { useEffect, useState } from 'react';
import type { Lesson } from '../../../src/content/schema';
import { api, ApiError } from '../api';
import { LessonPlayer } from '../components/LessonPlayer';
import { navigate } from '../router';
import { Icon, Loading } from '../components/Icon';

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
      <div className="card empty-state" role="alert">
        <span className="empty-icon" aria-hidden="true">
          <Icon name="alert" size={28} />
        </span>
        <p>{error}</p>
        <button className="btn" onClick={() => navigate('/aprender')}>
          Volver a la ruta
        </button>
      </div>
    );
  if (!lesson) return <Loading label="Cargando lección…" />;
  return <LessonPlayer key={lesson.id} lesson={lesson} />;
}
