import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  app.innerHTML = `
  <h1 class='text-4xl font-bold text-emerald-400'>Road to Avengers: Doomsday</h1>
  <p class='mt-2 text-slate-400'>Tailwind funcionando</p>
  `;
}
