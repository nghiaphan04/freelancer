uvicorn app.main:app --reload --port 8081
# 📄 CV Matching AI System

---

# 🚀 Giới thiệu

Dự án **CV Matching AI System** là hệ thống sử dụng AI để:

- 📥 Upload và đọc CV (PDF / text)
- 🧠 Phân tích nội dung CV và Job Description
- 🎯 Đánh giá mức độ phù hợp
- 📊 Xếp hạng CV theo Job

👉 Mô phỏng hệ thống tuyển dụng thực tế (**ATS - Applicant Tracking System**)

---

# 🧠 Kiến trúc hệ thống

## 🔥 Pipeline chính

```
CV / Job
   ↓
Preprocess (clean text)
   ↓
Embedding (vector hóa)
   ↓
Retrieve (lọc top K nhanh)
   ↓
Rerank (so sánh sâu)
   ↓
Scoring (tính điểm)
   ↓
Output
```

---

# ⚙️ Công nghệ sử dụng

## 🧠 AI / ML

- `sentence-transformers`
  - `BAAI/bge-base-en` → embedding
  - `BAAI/bge-reranker-base` → rerank

- `scikit-learn`
  - cosine similarity

---

## 🚀 Backend

- `FastAPI`
- `Python`

---

## 📄 Xử lý dữ liệu

- `pdfplumber` → đọc CV
- custom preprocessing

---

# 📂 Cấu trúc thư mục

```
app/
│
├── api/
│   ├── cv.py
│   ├── job.py
│   ├── analyze.py
│   ├── rank.py
│
├── services/
│   ├── analysis_service.py
│   ├── embedding_service.py
│   ├── rerank_service.py
│   ├── scoring_service.py
│   ├── preprocess_service.py
│   ├── retrieve_service.py
│   ├── pdf_service.py
│   ├── storage_service.py
│
├── main.py
```

---

# 🧠 Giải thích các thành phần

---

## 🔹 Preprocess

```python
preprocess_text(text)
```

- chuẩn hóa text
- loại bỏ ký tự thừa
- tăng độ chính xác model

---

## 🔹 Embedding

```python
embed_cv(text)
embed_job(text)
```

- chuyển text → vector
- giúp so sánh semantic

---

## 🔹 Retrieve

```python
retrieve_top_k(job_emb, cv_list, k)
```

- lọc nhanh CV phù hợp
- giảm chi phí rerank

---

## 🔹 Rerank

```python
rerank_score(cv_text, job_text)
```

- so sánh sâu giữa CV và Job
- chính xác hơn embedding

---

## 🔹 Scoring

- kết hợp embedding + rerank
- thêm penalty & boost

---

# 📊 Giải thích các tham số Output

## Ví dụ kết quả

```json
{
  "embedding_score": 85.3,
  "rerank_score": 72.1,
  "final_score": 80.5,
  "explanation": "Strong match"
}
```

---

## 🔹 1. embedding_score

- độ tương đồng ngữ nghĩa
- dùng cosine similarity

**Range:** 0–100

| Score | Ý nghĩa      |
| ----- | ------------ |
| >85   | rất giống    |
| 70–85 | liên quan    |
| <70   | ít liên quan |

---

## 🔹 2. rerank_score

- so sánh sâu bằng AI model

**Range:** 0–100

| Score | Ý nghĩa       |
| ----- | ------------- |
| >70   | rất phù hợp   |
| 50–70 | trung bình    |
| <50   | không phù hợp |

---

## 🔹 3. final_score ⭐

### Công thức:

```python
final_score = 0.3 * embedding + 0.7 * rerank
```

---

### Các điều chỉnh:

#### 🔥 Rerank fallback

```
rerank ~50 → dùng embedding
```

#### 🔥 Domain penalty

```
lệch ngành → giảm 50%
```

#### 🔥 Boost cùng domain

```
embedding cao → +5
```

#### 🔥 Boost QA/Test

```
QA vs QA → +5
```

#### 🔥 Soft decisiveness

```
score cao → tăng nhẹ
score thấp → giảm nhẹ
```

---

### Thang điểm:

| Score | Kết luận     |
| ----- | ------------ |
| >75   | Strong match |
| 50–75 | Moderate     |
| <50   | Low          |

---

## 🔹 4. explanation

| Value          | Ý nghĩa       |
| -------------- | ------------- |
| Strong match   | rất phù hợp   |
| Moderate match | trung bình    |
| Low match      | không phù hợp |

---

# 📡 API

---

## 🔹 Upload CV

POST `/api/cv/upload`

---

## 🔹 Get CV

GET `/api/cv/`

---

## 🔹 Create Job

POST `/api/job/create`

---

## 🔹 Get Job

GET `/api/job/`

---

## 🔹 Analyze

POST `/api/analyze`

**Input:**

```
cv_id, job_id
```

---

## 🔹 Rank CV ⭐

GET `/api/rank?job_id=1&top_k=5`

---

# 🧪 Testing

- `test_system.py`
- `test_system_100.py`
- `test_system_1000.py`

---

# 📊 Kết quả

```
Accuracy: ~96–97%
```

---

# 🚀 Ưu điểm

- nhanh (cache)
- chính xác (rerank)
- scale tốt
- đa domain
- gần production

---

# ⚠️ Hạn chế

- chưa fine-tune
- chưa dùng vector DB
- chưa explain chi tiết

---

# 🚀 Hướng phát triển

- FAISS / Vector DB
- LLM explain
- dashboard UI
- training model riêng

---

# 🧠 Tổng kết

Hệ thống sử dụng:

```
Embedding + Reranking + Rule-based
```

👉 Đây là kiến trúc thực tế của:

- ATS
- LinkedIn
- Job matching systems

---

# 👨‍💻 Tác giả

Minh Quân

---
