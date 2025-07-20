const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const { goodResponseDoc, badResponse } = require('../../utils/response');
const Question = require('../../models/questions');
const fs = require('fs');

class GeminiExamGenerator {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.fileManager = new GoogleAIFileManager(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });
  }

  static generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
  };

  async uploadFile(path, mimeType) {
    try {
      const uploadResult = await this.fileManager.uploadFile(path, {
        mimeType,
        displayName: path,
      });
      return uploadResult.file;
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  async waitForFilesActive(files) {
    const maxRetries = 5;
    const baseDelay = 5000;
    for (const file of files) {
      let currentFile = await this.fileManager.getFile(file.name);
      let retryCount = 0;
      while (currentFile.state === 'PROCESSING' && retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount);
        process.stdout.write('.');
        await new Promise((resolve) => setTimeout(resolve, delay));
        currentFile = await this.fileManager.getFile(file.name);
        retryCount++;
      }
      if (currentFile.state !== 'ACTIVE') {
        throw new Error(
          `File ${currentFile.name} failed to process after ${maxRetries} retries`
        );
      }
    }
  }

  async generateExamQuestions(filePaths, mimeTypes, res, noOfQuestions) {
    try {
      if (filePaths.length !== mimeTypes.length) {
        throw new Error('File paths and mime types must have the same length.');
      }

      const files = [];
      for (let i = 0; i < filePaths.length; i++) {
        const file = await this.uploadFile(filePaths[i], mimeTypes[i]);
        files.push(file);
      }

      await this.waitForFilesActive(files);

      const parts = files.map((file) => ({
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri,
        },
      }));

      parts.push({
        text: `generate ${noOfQuestions} questions from the provided documents, following the structure outlined below. represent them accurately using the appropriate HTML tags to ensure proper display on the frontend. Ensure all questions, options, and solutions are well-structured in HTML, with detailed explanations for solutions step by step in a way that it can be understood easily. add html line brake while explaining to make the solution readable.replace the( *) with (X) for multiplication , use subscript tag for subscripts and superscript tag when it should be used add the appropriate formulas and symbols for the equations. Avoid using Latex and Katex. use the appropriate html style and format to ensure matrix questions are well structured so they can be properly represented. Return only the JSON result, with no additional text or explanation outside the JSON. return only the json. Heres JSON Structure:                {
                "id": 1,
                "question": "Which of the following is a non-renewable natural resource?",
                "options": {
                "a": "Rubber",
                "b": "Oil palm",
                "c": "Coal",
                "d": "Cocoa"
                },
                "answer": "c",
                "reason": "Coal is a non-renewable natural resource as it takes millions of years to form.",
                "examtype": "waec",
                "examyear": "2023"
                },              }`,
      });

      const chatSession = this.model.startChat({
        generationConfig: GeminiExamGenerator.generationConfig,
        history: [
          {
            role: 'user',
            parts: parts,
          },
        ],
      });

      const result = await chatSession.sendMessage('Generate content');
      let response = result.response.text();

      // Remove markdown code blocks (```json ... ```)
      response = response.replace(/```(json)?\n?([\s\S]*?)\n?```/g, '$2');

      // Remove any leading/trailing whitespace or newlines
      response = response.trim();

      let jsonArray;

      try {
        jsonArray = JSON.parse(response);

        // Optional: Add JSON structure validation here
        if (!Array.isArray(jsonArray)) {
          throw new Error('Parsed JSON is not an array.');
        }
        // You could add checks for the expected structure of each object in the array
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        console.error('Raw response:', response); // Log the raw response for debugging.
        return badResponse(
          res,
          'Error Compiling Question, Please try again. JSON parsing failed.'
        );
      }

      return jsonArray;
    } catch (error) {
      console.log(error);
      badResponse(res, `Failed to generate Content ${error}`);
    }
  }
}

exports.generateExamQuestions = async (req, res, next) => {
  let filePaths = [];
  try {
    const generator = new GeminiExamGenerator(process.env.GEMINI_API_KEY);
    const { questionCategory, subject, exam, noOfQuestions, organization } =
      req.body;
    if (!questionCategory) {
      return badResponse(res, 'Provide the question category');
    }
    if (!subject) {
      return badResponse(res, 'Provide the subject');
    }
    if (!exam) {
      return badResponse(res, 'Provide the exam');
    }
    if (!req.files || req.files.length === 0) {
      return badResponse(res, 'No files uploaded');
    }

    const mimeTypes = [];
    req.files.forEach((file) => {
      filePaths.push(file.path);
      mimeTypes.push(file.mimetype);
    });

    const questions = await generator.generateExamQuestions(
      filePaths,
      mimeTypes,
      res,
      noOfQuestions
    );

    filePaths.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    if (questions && questions.length > 0) {
      //   const generatedQuestions = await Question.create({
      //     user: user.cbt,
      //     title,
      //     questions,
      //     organization
      //   });
      const questionDocs = questions.map((q) => ({
        question: q.question,
        options: q.options,
        answer: q.answer,
        reason: q.reason,
        examyear: 2025,
        section: q.section,
        questionType: q.questionType,
        questionCategory: q.questionCategory,
        exam: exam,
        method: 'ai',
        subject: subject,
        organization,
      }));
      const generatedQuestions = await Question.insertMany(questionDocs);

      return goodResponseDoc(res, 'Questions Generated', 200, {
        noOfQuestions: generatedQuestions.length,
        questions: generatedQuestions,
      });
    } else {
      badResponse(res, 'Something went wrong, Please try again');
    }
  } catch (error) {
    filePaths.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    next(error);
  }
};
