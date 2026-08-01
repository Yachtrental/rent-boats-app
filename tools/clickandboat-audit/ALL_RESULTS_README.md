# Click&Boat Palma: resultados completos

Este colector trata por separado:

- fichas públicas de embarcaciones (`/es/alquiler-barcos/`), y
- experiencias náuticas (`/es/activities/`).

El buscador general mezcla ambos tipos dentro de `data-testid="item-card"`. Las experiencias se enlazan con su embarcación subyacente mediante el identificador `product_id` presente en sus imágenes públicas.

Salidas principales:

- `resultados_busqueda.csv`: todos los resultados únicos del buscador;
- `barcos_cards.csv`: fichas de barcos;
- `experiencias.csv`: experiencias y su `product_id` relacionado;
- `particiones.csv`: trazabilidad de las facetas utilizadas;
- `resumen.json`: control contra el contador público.
