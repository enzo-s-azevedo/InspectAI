# Integration Testing Report

Generated at: 2026-04-16T17:31:40.366Z
Started at: 2026-04-16T17:31:39.991Z
Duration: 375 ms

## 1. Summary of Tested Integrations

- Backend API contract and endpoint status for health, usuarios, placas, defeitos, relatorios
- Database integration through create/read flows spanning usuario -> placa -> defeito -> relatorio
- Frontend availability and frontend proxy communication (/backend-api/*) with backend
- System-wide validation of frontend -> backend -> database behavior via proxied POST+GET
- Container communication checks between backend and AI service

## 2. Pass/Fail Status Per Integration Point

| Integration Point | Category | Status | Duration (ms) | Details |
|---|---|---|---:|---|
| Backend health endpoint contract | Backend/API | PASS | 77 | status=200 aiStatus=IA Online sem modelo |
| Backend usuarios GET | Backend/API | PASS | 6 | usuarios=15 |
| Backend placas GET | Backend/API | PASS | 6 | placas=13 |
| Backend defeitos GET | Backend/API | PASS | 6 | defeitos=8 |
| Backend relatorios GET | Backend/API | PASS | 6 | relatorios=7 |
| Database port reachable | Docker/Network | PASS | 2 | 127.0.0.1:3307 reachable |
| Backend create usuario | Backend/DB | PASS | 18 | userId=cmo1raoci002agyg28am67w0m |
| Backend create placa | Backend/DB | PASS | 16 | placaId=cmo1raocy002bgyg2t8wqp9qm |
| Backend create defeito with relations | Backend/DB | PASS | 20 | defeitoId=cmo1raodf002egyg2jdeolk2u |
| Backend create relatorio linked to defeito | Backend/DB | PASS | 28 | relatorioId=cmo1raodz002igyg2o3udqrvm |
| Backend detection upload via API | Backend/API | PASS | 23 | detections=0 saved=0 |
| Backend read created defeito by placaCodigo filter | Backend/DB | PASS | 6 | filteredCount=1 |
| Backend read created relatorio by usuarioId filter | Backend/DB | PASS | 6 | filteredCount=1 |
| Frontend root is reachable | Frontend | PASS | 9 | frontend-html-ok |
| Frontend dashboard shell and metrics route | Frontend | PASS | 15 | markers=6; counts=9/15/16 |
| Frontend Usuarios page renders | Frontend | PASS | 3 | markers=3 |
| Frontend Defeitos page renders | Frontend | PASS | 3 | markers=2 |
| Frontend Relatorios page renders | Frontend | PASS | 3 | markers=3 |
| Frontend Imagens page renders | Frontend | PASS | 3 | markers=4 |
| Frontend Configuracoes page renders health block | Frontend | PASS | 4 | markers=5 |
| Frontend proxy health (frontend -> backend) | Frontend/Backend | PASS | 8 | proxyHealth=ok |
| Frontend proxy detection upload | Frontend/Backend | PASS | 58 | proxyDetections=0 saved=0 |
| System flow via frontend proxy creates usuario in DB | System-Wide | PASS | 47 | proxyInsertedUserId=cmo1raoio002ogyg2x19dxz9z |
| AI service health endpoint | Containers | PASS | 2 | aiStatus=IA Online sem modelo |

## 3. Failed Endpoints or Flows

- None

## 4. Root Cause Analysis

- No integration failures were detected in this run.

## 5. Suggested Fixes

- No fixes required for this run.

## 6. Overall System Health Score

- Health Score: 100%
- Passed: 24/24
- Failed: 0/24

## Environment

- BACKEND_BASE_URL: http://localhost:3001/api
- FRONTEND_BASE_URL: http://localhost:3000
- FRONTEND_API_BASE_URL: http://localhost:3000/backend-api
- AI_BASE_URL: http://localhost:5005