# Integration Validation Report

Generated at: 2026-05-10

## Summary

This report reflects the current database model after the placas/defeitos cleanup.

## Validated Locally

| Check | Status | Notes |
|---|---|---|
| Prisma schema validation | PASS | `backend/prisma/schema.prisma` is valid with Prisma 5.22.0 |
| Database reset/push | PASS | `npm run db:reset:push` synced MySQL with the simplified schema |
| Seed | PASS | Base usuarios, modelos, placas, defeitos, relatorio and inspecao were created |
| Backend build | PASS | `npm run build` in `backend` completed successfully |
| Frontend build | PASS | `npm run build` in repo root completed successfully |

## Current Database Shape

- `placas.id`, `defeitos.id` and `defeitos_video.id` are numeric IDs.
- `defeitos` now keeps only the fields used by the current defect workflow.
- `defeitos.confirmado` is the source of truth for true defect vs false positive.
- `defeitos_video` stores only the video-specific complement: linked defect, event date/time and frame.
- `relatorios.codigoInterno` is still valid and remains part of the reports flow.

## Notes

Full end-to-end integration tests were not rerun for this report. The previous historical report was replaced because it referenced the old schema and old detection failures.
