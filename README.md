# Assessment Comportamental — Corretores de Imóveis de Alto Padrão

Sistema de avaliação comportamental para corretores que atuam no mercado imobiliário premium (ticket médio R$ 1,3 mi – R$ 10 mi+).

## Instalação

```bash
npm install
```

## Configuração

```bash
cp .env.example .env
# edite .env e defina GESTOR_PASSWORD com uma senha segura
```

## Execução

```bash
npm start
```

O servidor sobe na porta definida em `PORT` (padrão: 3000).

## Endpoint de saúde

```
GET /health
```
