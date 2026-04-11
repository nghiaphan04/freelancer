package com.workhub.api.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URL;

@Service
public class PdfParsingService {

    public String extractTextFromUrl(String pdfUrl) {
        try (InputStream in = java.net.URI.create(pdfUrl).toURL().openStream();
             PDDocument document = Loader.loadPDF(in.readAllBytes())) {
            
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            
            // Limit text to avoid blowing up tokens
            return text.length() > 20000 ? text.substring(0, 20000) : text;
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }
}
