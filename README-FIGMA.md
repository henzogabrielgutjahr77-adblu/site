# Integração do projeto com o Figma

Este projeto agora expõe um endpoint para exportar dados do projeto para o Figma.

## Como usar

1. Inicie o projeto:
   - npm run dev

2. Acesse:
   - http://localhost:3000/api/figma-export

3. O endpoint retorna um JSON com:
   - tokens de design (cores, tipografia, spacing, radius, shadow)
   - estrutura de componentes e rotas do projeto
   - metadados do site

4. No Figma, você pode:
   - importar esse JSON em um plugin de tokens,
   - usar como base para um design system,
   - manter os valores sincronizados manualmente a partir desse export.

## Arquivos criados

- app/api/figma-export/route.ts
- lib/figma.js
- public/figma-design-system.json
