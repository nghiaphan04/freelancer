from app.services.embedding_service import embed_cv, embed_job
from app.services.scoring_service import calculate_score_from_embedding
from app.services.rerank_service import rerank_score
from app.services.preprocess_service import preprocess_text


# ===== DOMAIN CHECK =====
def is_marketing(text):
    keywords = [
        "marketing", "seo", "ads", "branding",
        "campaign", "content", "social media"
    ]
    return any(k in text.lower() for k in keywords)


def is_qa(text):
    keywords = [
        "qa", "test", "testing",
        "selenium", "automation"
    ]
    return any(k in text.lower() for k in keywords)


# ===== MAIN ANALYZE =====
def analyze_cv_job(cv_text, job_text):

    # ===== 1. PREPROCESS =====
    cv_text = preprocess_text(cv_text)
    job_text = preprocess_text(job_text)

    # ===== 2. EMBEDDING =====
    cv_emb = embed_cv(cv_text)
    job_emb = embed_job(job_text)

    embedding_score = calculate_score_from_embedding(cv_emb, job_emb)

    # ===== 3. RERANK =====
    rerank = rerank_score(cv_text, job_text)

    # 🔥 FIX rerank bị kẹt ~50
    if 45 <= rerank <= 55:
        rerank = embedding_score * 0.8

    # ===== 4. BASE SCORE =====
    final_score = (
        0.3 * embedding_score +
        0.7 * rerank
    )

    # ===== 5. DOMAIN PENALTY =====
    if is_marketing(cv_text) != is_marketing(job_text):
        final_score *= 0.5

    # ===== 6. BOOST SAME DOMAIN =====
    if embedding_score > 90 and rerank > 65:
        final_score += 5

    # ===== 7. BOOST QA DOMAIN =====
    if is_qa(cv_text) and is_qa(job_text):
        final_score += 5

    # ===== SOFT DECISIVENESS =====

    # boost HIGH mượt
    if final_score > 65:
        final_score += (final_score - 65) * 0.2

    # giảm LOW mượt
    if final_score < 45:
        final_score -= (45 - final_score) * 0.2

    # ===== 9. CLAMP =====
    final_score = max(0, min(final_score, 100))

    # ===== 10. EXPLANATION =====
    if final_score > 75:
        explanation = "Strong match"
    elif final_score > 50:
        explanation = "Moderate match"
    else:
        explanation = "Low match"

    return {
        "embedding_score": round(embedding_score, 2),
        "rerank_score": round(rerank, 2),
        "final_score": round(final_score, 2),
        "explanation": explanation
    }