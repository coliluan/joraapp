import dotenv from 'dotenv';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/dbconnect';

const pdfSchema = new mongoose.Schema({
  name: String,
  customName: String,
  customSubtitle: String,
  data: mongoose.Schema.Types.Buffer,
  contentType: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const PdfModel = mongoose.model('pdfs', pdfSchema);

async function uploadPDF() {
  try {
    // Lidhu me MongoDB
    await mongoose.connect(MONGO_URL);
    console.log('✅ MongoDB u lidh');

    // Lexo PDF-in nga kompjuteri
    const filePath = path.resolve('./sample.pdf'); // ← Zëvendëso me rrugën e saktë
    const pdfBuffer = fs.readFileSync(filePath);

    // Krijo dokumentin
    const pdf = new PdfModel({
      name: 'sample.pdf',
      customName: 'Dokument Shembull',
      customSubtitle: 'Ngarkuar nga backend manualisht',
      data: pdfBuffer,
      contentType: 'application/pdf',
    });

    // Ruaje në bazën e të dhënave
    await pdf.save();
    console.log('✅ PDF u ruajt me sukses në MongoDB:', pdf._id);

    // Mbyll lidhjen
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Gabim gjatë ngarkimit të PDF:', error);
  }
}

uploadPDF();
