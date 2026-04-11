package com.workhub.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.workhub.api.entity.Job;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${python.api.base-url:http://localhost:8081}")
    private String pythonBaseUrl;

    @Data
    public static class GeminiEvaluationResult {
        private Double overallScore;
        private String explanation;
    }

    public GeminiEvaluationResult evaluateResume(String resumeText, String resumeUrl, Job job) {
        if (resumeText == null || resumeText.isBlank()) {
            GeminiEvaluationResult result = new GeminiEvaluationResult();
            result.setOverallScore(0.0);
            result.setExplanation("AI evaluation disabled – placeholder result.");
            return result;
        }

        // 1. Try Gemini first
        try {
            GeminiEvaluationResult result = callGemini(resumeText, job, apiKey);
            if (result != null) {
                log.info("====== AI EVALUATION (GEMINI) SUCCESS ======");
                log.info("GEMINI SCORE: {}", result.getOverallScore());
                return result;
            }
        } catch (Exception e) {
            log.error("Gemini estimation failed. Error: {}", e.getMessage());
        }

        // 2. Fallback to Local Python ML model if Gemini fails
        log.warn("====== FALLING BACK TO LOCAL ML MODEL ======");
        return evaluateWithLocalModel(resumeUrl, job);
    }

    private GeminiEvaluationResult callGemini(String resumeText, Job job, String key) throws Exception {
        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("Gemini API Key is missing");
        }
        
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + key;

        String prompt = String.format("""
            You are a professional HR analysis system. 
            Evaluate the candidate's Resume/CV against the Job Description.
            
            SCORING RULE: Provide a numerical matching score from 0.0 to 100.0 (where 100 is a perfect match).
            ANALYSIS RULE: Provide a brief analysis of strengths and weaknesses in Vietnamese.
            
            IMPORTANT: Your final output must be in Vietnamese (Tiếng Việt).
            
            JOB INFORMATION:
            Title: %s
            Description: %s
            Requirements: %s
            Skills: %s
            
            CANDIDATE CV/RESUME CONTENT:
            %s
            
            RETURN FORMAT RULES:
            You MUST return EXACTLY the following JSON format:
            {
              "overallScore": 85.5,
              "explanation": "Điểm mạnh:\\n- ...\\n\\nĐiểm yếu:\\n- ..."
            }
            """, 
            job.getTitle(), 
            job.getDescription(), 
            job.getRequirements() != null ? job.getRequirements() : "", 
            job.getSkills() != null ? String.join(", ", job.getSkills()) : "",
            resumeText);

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));
        requestBody.put("contents", List.of(content));

        Map<String, Object> generationConfig = new HashMap<>();
        // Removed responseMimeType as it causes 400 error in some API versions
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        String responseBody = restTemplate.postForObject(url, request, String.class);
        JsonNode root = objectMapper.readTree(responseBody);
        
        String jsonText = root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
                    
        // Clean markdown code blocks if present
        if (jsonText.contains("```json")) {
            jsonText = jsonText.substring(jsonText.indexOf("```json") + 7);
            if (jsonText.contains("```")) {
                jsonText = jsonText.substring(0, jsonText.lastIndexOf("```"));
            }
        } else if (jsonText.contains("```")) {
            jsonText = jsonText.substring(jsonText.indexOf("```") + 3);
            if (jsonText.contains("```")) {
                jsonText = jsonText.substring(0, jsonText.lastIndexOf("```"));
            }
        }
        
        JsonNode resultNode = objectMapper.readTree(jsonText.trim());
        
        GeminiEvaluationResult result = new GeminiEvaluationResult();
        if (resultNode.has("overallScore")) {
            result.setOverallScore(resultNode.get("overallScore").asDouble());
        } else {
            result.setOverallScore(0.0);
        }
        
        if (resultNode.has("explanation")) {
            result.setExplanation(resultNode.get("explanation").asText());
        }
        
        return result;
    }

    private GeminiEvaluationResult evaluateWithLocalModel(String resumeUrl, Job job) {
        try {
            // 0. Download CV
            byte[] fileBytes = restTemplate.getForObject(resumeUrl, byte[].class);
            if (fileBytes == null) throw new RuntimeException("CV download failed");

            // 1. Upload CV to Python
            String uploadUrl = pythonBaseUrl + "/api/cv/upload";
            org.springframework.util.LinkedMultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
            body.add("file", new org.springframework.core.io.ByteArrayResource(fileBytes) {
                @Override public String getFilename() { return "cv.pdf"; }
            });
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            HttpEntity<org.springframework.util.MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
            JsonNode uploadRes = restTemplate.postForObject(uploadUrl, entity, JsonNode.class);
            int cvId = uploadRes.get("cv_id").asInt();

            // 2. Create Job in Python
            String jobText = job.getTitle() + "\n" + job.getDescription();
            String createJobUrl = UriComponentsBuilder.fromHttpUrl(pythonBaseUrl + "/api/job/create")
                    .queryParam("job_text", jobText).toUriString();
            JsonNode jobRes = restTemplate.postForObject(createJobUrl, null, JsonNode.class);
            int jobIdPython = jobRes.get("job_id").asInt();

            // 3. Analyze
            String analyzeUrl = UriComponentsBuilder.fromHttpUrl(pythonBaseUrl + "/api/analyze/")
                    .queryParam("cv_id", cvId).queryParam("job_id", jobIdPython).toUriString();
            JsonNode analyzeRes = restTemplate.postForObject(analyzeUrl, null, JsonNode.class);
            
            GeminiEvaluationResult result = new GeminiEvaluationResult();
            result.setOverallScore(analyzeRes.path("final_score").asDouble(0.0));
            result.setExplanation("Kết quả phân tích từ mô hình local (Gemini hiện đang bận hoặc quá tải).");
            
            log.info("====== LOCAL ML MODEL SUCCESS ======");
            log.info("LOCAL SCORE: {}", result.getOverallScore());
            return result;
        } catch (Exception e) {
            log.error("Local fallback also failed: {}", e.getMessage());
            GeminiEvaluationResult result = new GeminiEvaluationResult();
            result.setOverallScore(0.0);
            result.setExplanation("Lỗi trong quá trình đánh giá: " + e.getMessage());
            return result;
        }
    }
}
