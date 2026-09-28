import './style.css';
import { renderAppShell } from './ui/app-shell';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('No se encontró el elemento #app en index.html');
}

app.innerHTML = renderAppShell();
