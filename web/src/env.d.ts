/// <reference types="vite/client" />
declare module 'virtual:concept-lessons' {
  const index: Record<string, { id: string; title: string }[]>;
  export default index;
}
