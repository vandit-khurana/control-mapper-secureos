# Control Mapping System

## Overview

This project builds a system to ingest, normalize, and map security/compliance controls across multiple sources:

* SOC 2 Report (document)
* Trust Center (web URL)
* Common Control Master (Excel – normalized base)

The system extracts controls from each source, semantically normalizes them, and maps them to a shared set of normalized common controls to identify overlap.

---

## Features

* Extract controls from:

  * DOCX (SOC 2 report)
  * Web (Trust Center URL)
  * Excel (Common Control Master)

* Normalize controls using LLM (semantic normalization)

* Generate embeddings and compute similarity

* Support:

  * 1:1 mappings
  * 1:many mappings
  * many:1 mappings

* Classify matches:

  * **FULL** → strong semantic match
  * **PARTIAL** → partial overlap

* Provide rationale for mappings

* Simple UI to test and visualize output

---

## Project Structure

```
backend/
  parsers/
  services/
frontend/
eval/
data/ (you add this)
.env
README.md
```

---

## Setup Instructions

### 1. Clone / Extract Project

Unzip the project and open in terminal or VS Code.

---

### 2. Add Input Files

Create a `data/` folder in root and add:

```
data/
  soc2.docx
  controls.xlsx
```

---

### 3. Add Environment Variable

Create a `.env` file:

```
OPENAI_API_KEY=your_api_key_here
```

---

### 4. Install Dependencies

```
npm init -y
npm install express cors mammoth xlsx cheerio axios openai dotenv
```

---

### 5. Run Backend

```
node backend/server.js
```

Server will run on:

```
http://localhost:3000
```

---

### 6. Open UI

Open in browser:

```
frontend/index.html
```

Enter a Trust Center URL and click **Analyze**.

---

## API Endpoint

### GET `/analyze?url=<trust_center_url>`

### Response Format

```json
{
  "source_controls": [
    { "control_id": "SC-1", "raw_text": "..." }
  ],
  "normalized_common_controls": [
    { "control_id": "NCC-1", "text": "..." }
  ],
  "mappings": [
    {
      "source_control_ids": ["SC-1"],
      "normalized_common_control_ids": ["NCC-1"],
      "match_type": "full",
      "rationale": "Semantic similarity between controls"
    }
  ]
}
```

---

## Approach

### 1. Extraction

* SOC 2: parsed using DOCX reader
* Trust Center: scraped using HTML parser
* Excel: loaded as normalized base controls

---

### 2. Normalization

Controls from SOC 2 and Trust Center are normalized using an LLM into canonical representations.

Example:

* "Admins must use MFA"
* "Privileged access requires multi-factor authentication"

→ normalized to same intent

---

### 3. Embedding + Matching

* Generate embeddings using OpenAI
* Compute cosine similarity between:

  * source controls
  * base controls

---

### 4. Mapping Logic

Thresholds:

* **FULL match** → similarity > 0.85
* **PARTIAL match** → similarity > 0.6
* **NONE** → below threshold

Mappings support:

* one-to-one
* one-to-many
* many-to-one

---

### 5. Rationale

Each mapping includes a short explanation indicating semantic similarity between controls.

---

## Evaluation

### Dataset

Located in:

```
eval/dataset.json
```

Contains labeled pairs of controls with expected match types.

---

### Eval Script

Run:

```
node eval/eval.js
```

Evaluates matching logic against labeled examples.

---

## Tradeoffs

* LLM-based normalization improves semantic understanding but increases latency and cost
* Embeddings provide flexible matching but require careful threshold tuning
* Generic web scraping may not capture all controls accurately from every Trust Center

---

## Limitations

* Limited evaluation dataset (small sample size)
* Basic rationale generation (can be improved using LLM)
* No caching → repeated API calls increase latency and cost
* Domain grouping (e.g., CC1, CC6) not fully implemented

---

## Future Improvements

* Add caching layer for normalization and embeddings
* Improve rationale using LLM-generated explanations
* Implement domain-based grouping and filtering
* Enhance UI with tables, filters, and match visualization
* Expand evaluation dataset for better accuracy measurement

---

## Notes

* The system is designed to work with:

  * any SOC 2 report
  * any Trust Center URL
  * any updated control library

* For demo purposes, processing is limited to a subset of controls to reduce API usage

---
