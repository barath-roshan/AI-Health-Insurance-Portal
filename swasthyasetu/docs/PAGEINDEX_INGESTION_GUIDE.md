# PageIndex Ingestion Guide

## Overview
PageIndex structures official health policy documents into hierarchical section trees for vectorless document retrieval.

## Ingestion Subsystem Components
Location: `swasthyasetu/backend/app/rag/pageindex/`

- **`client.py`**: API client communicating with PageIndex API or generating local section trees.
- **`document_loader.py`**: Reads PDF/HTML/TXT documents and computes SHA-256 cryptographic checksums.
- **`document_parser.py`**: Parses text into page-referenced section nodes.
- **`tree_manager.py`**: Manages reading, writing, and versioning of PageIndex section trees.
- **`retrieval.py`**: Vectorless reasoning engine performing section and page lookup based on query context and scheme aliases.
- **`source_registry.py`**: Manages official sources and verification metadata.
- **`ingestion_pipeline.py`**: Idempotent ingestion pipeline for new policy documents.
- **`validation.py`**: Validates document tree schemas and integrity.

## Administrative Ingestion API
Administrators can ingest or reprocess documents via FastAPI admin endpoints:
- `POST /api/admin/rag/ingest`
- `GET /api/admin/rag/sources`
- `GET /api/admin/rag/ingestion-jobs`
- `POST /api/admin/rag/reprocess/{source_id}`
