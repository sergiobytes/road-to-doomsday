import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  app.innerHTML = `
    <main class="mx-auto max-w-5xl px-4 py-12">
      <h1 class="text-4xl font-bold tracking-tight">Road to Avengers: Doomsday</h1>
      <p class="mt-2 text-slate-400">Estructura base lista. El contenido llega en la fase 1.</p>
    </main>
  `;
}
