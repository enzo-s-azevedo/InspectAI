# Integration Testing Report

Generated at: 2026-04-27T21:59:53.943Z
Started at: 2026-04-27T21:59:52.802Z
Duration: 1141 ms

## 1. Summary of Tested Integrations

- Backend API contract and endpoint status for health, usuarios, placas, defeitos, relatorios
- Database integration through create/read flows spanning usuario -> placa -> defeito -> relatorio
- Real YOLO inference using real PCB image fixtures from project dataset
- Batch upload validation using .zip with real images and persistence checks
- Frontend availability and frontend proxy communication (/backend-api/*) with backend
- System-wide validation of frontend -> backend -> database behavior via proxied POST+GET
- Container communication checks between backend and AI service

## 2. Pass/Fail Status Per Integration Point

| Integration Point | Category | Status | Duration (ms) | Details |
|---|---|---|---:|---|
| Load real image fixture for inference | QA/Fixtures | PASS | 3 | fixture=0ce50974-17.png size=1397407 path=/workspace/yolo/TREINO/data/validation/images/0ce50974-17.png |
| Wait AI service readiness | Containers | PASS | 48 | aiStatus=healthy model=best.pt |
| Wait backend with AI connectivity | Containers | PASS | 9 | backendApi=ok ai=healthy |
| Backend health endpoint contract | Backend/API | PASS | 8 | status=200 aiStatus=healthy |
| Backend usuarios GET | Backend/API | PASS | 5 | usuarios=17 |
| Backend placas GET | Backend/API | PASS | 8 | placas=32 |
| Backend defeitos GET | Backend/API | PASS | 25 | defeitos=264 |
| Backend relatorios GET | Backend/API | PASS | 8 | relatorios=8 |
| Database port reachable | Docker/Network | PASS | 1 | db:3306 reachable |
| Backend create usuario | Backend/DB | PASS | 18 | userId=cmohqpyze0064m2ddbbte0k82 |
| Backend create placa | Backend/DB | PASS | 17 | placaId=cmohqpyzu0065m2dd7v9k6iwf |
| Backend create defeito with relations | Backend/DB | PASS | 23 | defeitoId=cmohqpz0b0068m2ddf5n1ziln |
| Backend create relatorio linked to defeito | Backend/DB | PASS | 19 | relatorioId=cmohqpz0y006cm2ddldadsz8f |
| Backend detection upload via API | Backend/API | FAIL | 173 | Inferencia em imagem real deve retornar ao menos 1 deteccao |
| AI service real image inference | AI/Inference | PASS | 81 | fixture=0ce50974-17.png detections=14 |
| Backend detection upload via ZIP | Backend/API | FAIL | 397 | Inferencia em .zip real deve retornar deteccoes |
| Detection persistence integrity by placa | Backend/DB | PASS | 10 | apiByPlaca=0 zipByPlaca=0 apiDetections=0 zipDetections=0 |
| Backend read created defeito by placaCodigo filter | Backend/DB | PASS | 6 | filteredCount=1 |
| Backend read created relatorio by usuarioId filter | Backend/DB | PASS | 7 | filteredCount=1 |
| Frontend root is reachable | Frontend | PASS | 35 | frontend-html-ok |
| Frontend dashboard shell and metrics route | Frontend | PASS | 30 | markers=6; counts=265/35/18 |
| Frontend Usuarios page renders | Frontend | PASS | 7 | markers=3 |
| Frontend Defeitos page renders | Frontend | PASS | 7 | markers=2 |
| Frontend Relatorios page renders | Frontend | PASS | 6 | markers=3 |
| Frontend Imagens page renders | Frontend | PASS | 7 | markers=4 |
| Frontend Configuracoes page renders health block | Frontend | PASS | 6 | markers=5 |
| Frontend proxy health (frontend -> backend) | Frontend/Backend | PASS | 33 | proxyHealth=ok |
| Frontend proxy detection upload | Frontend/Backend | PASS | 116 | proxyDetections=0 saved=0 |
| System flow via frontend proxy creates usuario in DB | System-Wide | PASS | 26 | proxyInsertedUserId=cmohqpzr5006jm2dd2gv4m3b8 |
| AI service health endpoint | Containers | PASS | 2 | aiStatus=healthy |

## 3. Failed Endpoints or Flows

- Backend detection upload via API: Inferencia em imagem real deve retornar ao menos 1 deteccao
- Backend detection upload via ZIP: Inferencia em .zip real deve retornar deteccoes

## 4. Root Cause Analysis

- Backend detection upload via API: Inferencia em imagem real deve retornar ao menos 1 deteccao
- Backend detection upload via ZIP: Inferencia em .zip real deve retornar deteccoes

## 5. Suggested Fixes

- Backend detection upload via API: Analise o stack trace da rota/servico e ajuste o ponto de integracao com falha.
- Backend detection upload via ZIP: Analise o stack trace da rota/servico e ajuste o ponto de integracao com falha.

## 6. Overall System Health Score

- Health Score: 93%
- Passed: 28/30
- Failed: 2/30

## Environment

- BACKEND_BASE_URL: http://backend:3000/api
- FRONTEND_BASE_URL: http://frontend:3000
- FRONTEND_API_BASE_URL: http://frontend:3000/backend-api
- AI_BASE_URL: http://inspectai_ai:5000