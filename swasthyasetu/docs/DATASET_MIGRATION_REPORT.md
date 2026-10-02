# Dataset Migration Report

## Executive Summary
The historical metadata CSV (`health_scheme_rag_metadata_dataset.csv` containing ~910 entries) has been parsed, normalized, and converted into a production-oriented vectorless RAG data structure.

## Output Datasets Generated
Located under `swasthyasetu/backend/data/`:

1. **`scheme_catalogue.csv`**: Normalized scheme catalogue containing scheme IDs, names, coverage areas, benefits summaries, eligibility summaries, status, verification dates, and discovery tags.
2. **`source_registry.csv`**: Official source registry mapping schemes to verified document sources, checksums, URLs, verification status, and page counts.
3. **`scheme_aliases.csv`**: Comprehensive alias mapping table mapping alternate names, acronyms, and regional titles (e.g., PM-JAY, CMCHIS, MEDISEP, Ayushman Card) to canonical scheme IDs.
4. **`evaluation/`**: Synthetic evaluation datasets:
   - `retrieval_questions.jsonl`
   - `answer_grounding_cases.jsonl`
   - `conversation_regression.jsonl`
5. **`pageindex/trees/`**: PageIndex hierarchical section tree JSON files for all registered schemes.
6. **`reports/dataset_validation_report.json`**: Machine-readable validation report summarizing migration results.

## Transformation Metrics
- **Processed Schemes**: 130 unique health schemes
- **PageIndex Trees Created**: 130 document trees
- **Verification Status**: All records marked with `VERIFIED_OFFICIAL` or `NEEDS_REVIEW` traceability labels.
