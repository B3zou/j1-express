// Point d'entrée : écoute sur le port. L'application elle-même est dans app.ts.
import app from './app.js';

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`API prête sur le port ${port} (http://localhost:${process.env.API_PORT ?? port}/api)`);
});
