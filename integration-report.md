# Integration Testing Report

Generated at: 2026-05-13T18:46:01.630Z

| Step | Status | Duration (ms) | Details |
|---|---|---:|---|
| Database port reachable | PASS | 5 | 127.0.0.1:3307 |
| Backend health | PASS | 101 | ok |
| Create modelo | FAIL | 29 | Unexpected token '<', "<!DOCTYPE "... is not valid JSON |
| Create placa | FAIL | 13 | create-placa: expected 201, got 400. {"success":false,"data":null,"meta":{},"error":{"code":"VALIDATION_ERROR","message":"Codigo da placa e obrigatorio","details":null}} |
| Create defeito from image | FAIL | 10 | create-defeito: expected 201, got 400. {"success":false,"data":null,"meta":{},"error":{"code":"VALIDATION_ERROR","message":"placaId e classe/tipo sao obrigatorios","details":null}} |
| Read persisted relation chain | FAIL | 14 | defeito criado nao encontrado |
| Create defeito from video with SQL timestamp | FAIL | 8 | create-video-defeito: expected 201, got 400. {"success":false,"data":null,"meta":{},"error":{"code":"VALIDATION_ERROR","message":"placaId e classe/tipo sao obrigatorios","details":null}} |
| Frontend reachable | FAIL | 4 | fetch failed |
| Frontend proxy health | FAIL | 2 | fetch failed |
| Auth register / ensure admin | FAIL | 6 | Unexpected token '<', "<!DOCTYPE "... is not valid JSON |
| Auth login as admin | FAIL | 9 | Unexpected token '<', "<!DOCTYPE "... is not valid JSON |
| Admin access reports | FAIL | 6 | Unexpected token '<', "<!DOCTYPE "... is not valid JSON |
| Create funcionario user | FAIL | 14 | create-employee: expected 201, got 409. {"success":false,"data":null,"meta":{},"error":{"code":"UNIQUE_CONSTRAINT","message":"Email ja cadastrado","details":null}} |
| Funcionario access reports blocked | FAIL | 6 | Unexpected token '<', "<!DOCTYPE "... is not valid JSON |
| Funcionario access usuarios blocked | FAIL | 6 | funcionario deve receber 403 ao acessar usuarios |

Failures: 13