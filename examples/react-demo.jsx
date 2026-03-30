import React from 'react';
import { Toaster, sileo } from '../src/react';

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <button
        onClick={() =>
          sileo.success({
            title: '¡Éxito!',
            description: 'Animación gooey en React',
            fill: '#171717',
            roundness: 24,
            styles: {
              title: 'text-white!',
              badge: 'bg-white/20!',
              button: 'bg-white/10!',
            },
            autopilot: true,
          })
        }
      >
        Mostrar toast React
      </button>
    </>
  );
}
