# Movie Atlas

Base inicial de um projeto full stack para uma plataforma de filmes com frontend em React e backend em Django REST.

## Arquitetura inicial

### Frontend
- `frontend/`: aplicacao React com Vite
- pagina inicial simples para validar o setup
- pronto para evoluir para rotas, chamadas HTTP e estado global

### Backend
- `backend/`: projeto Django
- `backend/core/`: app inicial da API
- Django REST Framework para endpoints REST
- `drf-spectacular` para Swagger/OpenAPI
- endpoint inicial de health check em `/api/health/`

### Qualidade e fluxo
- Git inicializado na raiz
- testes unitarios e de integracao configurados na base
- documentacao de execucao centralizada neste README

## Estrutura de pastas

```text
movie atlas/
|-- backend/
|   |-- config/
|   |-- core/
|   |-- manage.py
|   `-- requirements.txt
|-- frontend/
|   |-- src/
|   |-- package.json
|   `-- vite.config.js
|-- .gitignore
`-- README.md
```

## Como rodar o projeto

### 1. Backend

Na raiz do projeto, ative o ambiente virtual que voce configurou:

```powershell
.\venv\Scripts\Activate.ps1
```

Instale as dependencias do backend se ainda nao estiverem instaladas nesse ambiente:

```powershell
pip install -r .\backend\requirements.txt
```

Crie o arquivo `backend/.env` a partir do exemplo e preencha o token do TMDB:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
```

Entre na pasta do backend, rode as migracoes e suba o servidor:

```powershell
cd .\backend
python manage.py migrate
python manage.py runserver
```

Endpoints iniciais:

- API health check: `http://localhost:8000/api/health`
- Upcoming movies: `http://localhost:8000/api/movies/upcoming`
- OpenAPI schema: `http://localhost:8000/api/schema/`
- Swagger UI: `http://localhost:8000/api/docs/`

O Django agora carrega automaticamente as variaveis do arquivo `backend/.env` ao iniciar. Assim, `TMDB_API_READ_ACCESS_TOKEN` fica disponivel via `os.environ` sem precisar exportar manualmente no terminal.

### 2. Frontend

Em outro terminal:

```powershell
cd .\frontend
npm install
npm run dev
```

Aplicacao inicial:

- Frontend: `http://localhost:5173`

## Como testar localmente

### Backend

```powershell
.\venv\Scripts\Activate.ps1
cd .\backend
python manage.py test
```

### Validar o carregamento do `.env`

Depois de preencher `backend/.env`, voce pode confirmar que o Django enxergou a variavel com:

```powershell
.\venv\Scripts\Activate.ps1
cd .\backend
python manage.py shell -c "import os; print(bool(os.environ.get('TMDB_API_READ_ACCESS_TOKEN')))"
```

Se tudo estiver certo, o comando deve imprimir `True`.

### Frontend

```powershell
cd .\frontend
npm run test
```

## Escopo desta entrega

Foi criada apenas a base inicial do projeto:

- setup do monorepo
- frontend React inicializado
- backend Django REST inicializado
- Swagger/OpenAPI configurado
- endpoint inicial de health check
- homepage simples no frontend
- testes iniciais

As funcionalidades de catalogo, busca, detalhes de filmes, proximos lancamentos e livros relacionados ficam para a proxima iteracao.
