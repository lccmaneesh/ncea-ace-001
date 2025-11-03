import { GoogleGenAI, Type, Modality } from '@google/genai';
import { Subject, Topic, Question, Feedback, MathFeedback, TopicProgress, SessionData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface QuestionWithPrompt extends Question {
    imagePrompt?: string;
}

const quizSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      questionText: {
        type: Type.STRING,
        description: 'The full text of the quiz question.',
      },
      questionType: {
        type: Type.STRING,
        enum: ['written', 'numeric'],
        description: 'The type of question, either written for English or numeric for Math.',
      },
      imagePrompt: {
        type: Type.STRING,
        description: "A detailed, descriptive prompt for an AI image generator to create a diagram for this question. Only include this field if an image is genuinely helpful. E.g., 'A simple line drawing of a right-angled triangle with labels: hypotenuse c, opposite a, adjacent b. Angle theta is between b and c.'",
      },
    },
    required: ['questionText', 'questionType'],
  },
};

const getBasePrompt = (subject: Subject, topic: Topic) => {
    if (subject === Subject.English) {
        if (topic.id === 'unfamiliar-text') {
            return `Generate a 5-question quiz for an NCEA Level 1 English student in New Zealand on analyzing an unfamiliar text. First, create a short, engaging, and previously unpublished text (either a short poem, a prose excerpt, or a non-fiction article snippet) suitable for a year-11 student, around 150-200 words. Then, generate 5 analytical questions based on this text. The questions should focus on identifying and explaining language features, author's purpose, and effect on the reader. For EACH question in the returned JSON array, the 'questionText' field MUST contain the full unfamiliar text followed by the specific question for analysis. This is critical so the student has the context for every question.`;
        }
        return `Generate a 5-question quiz for an NCEA Level 1 English student in New Zealand. The questions must be based on the novel 'Of Mice and Men' by John Steinbeck, focusing on the topic of "${topic.name}". Questions should require written, analytical answers suitable for aiming for an 'Excellence' grade. Keep vocabulary appropriate for a year-11 student.`;
    }
    return `Generate a 5-question quiz for an NCEA Level 1 Mathematics student in New Zealand. The questions must cover the '${topic.name}' topic (e.g., NCEA Achievement Standard AS91027 for Algebra). The difficulty should be appropriate for aiming for an 'Excellence' grade. Questions should have a numeric or simplified expression as the answer. For each question, if a visual diagram or image would be helpful for the student to understand the problem, provide a detailed and clear prompt for an AI image generator in the 'imagePrompt' field. If no image is necessary, omit the 'imagePrompt' field.`;
}

const getAdaptivePrompt = (basePrompt: string, progress: TopicProgress) => {
    const proficiencyPercent = (progress.proficiency * 100).toFixed(0);
    let adaptiveInstruction = `This student has a current mastery level of ${proficiencyPercent}% on this topic. `;

    if (progress.areasForImprovement.length > 0) {
        adaptiveInstruction += `Their previous sessions indicate they need to work on the following areas: ${progress.areasForImprovement.join(', ')}. Please create a quiz that specifically targets these areas to help them improve. `;
    } else if (progress.proficiency > 0.75) {
        adaptiveInstruction += `They are doing well. Please generate a quiz with more challenging questions to push them towards a deeper understanding and prepare them for 'Excellence' level responses. Introduce complexity or variations they may not have seen before.`;
    }
    return `You are an adaptive learning tutor for NCEA Level 1. ${adaptiveInstruction} Here is the original request for the quiz: "${basePrompt}"`;
};


export async function generateQuiz(subject: Subject, topic: Topic, progress?: TopicProgress): Promise<Question[]> {
  const model = 'gemini-2.5-pro';
  let prompt = getBasePrompt(subject, topic);

  if (progress && progress.history.length > 0) {
      prompt = getAdaptivePrompt(prompt, progress);
  }
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: quizSchema,
      temperature: 0.8,
    }
  });

  const jsonText = response.text.trim();
  const quizDataWithPrompts = JSON.parse(jsonText) as QuestionWithPrompt[];

  if (subject === Subject.Mathematics) {
    const imageGenerationPromises = quizDataWithPrompts.map(async (question) => {
      if (question.imagePrompt) {
        try {
          const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: question.imagePrompt }] },
            config: {
              responseModalities: [Modality.IMAGE],
            },
          });
          for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData) {
              question.imageData = part.inlineData.data;
              break;
            }
          }
        } catch (e) {
          console.error(`Failed to generate image for prompt: "${question.imagePrompt}"`, e);
        }
      }
      const { imagePrompt, ...finalQuestion } = question;
      return finalQuestion as Question;
    });
    return Promise.all(imageGenerationPromises);
  }

  return quizDataWithPrompts as Question[];
}

const englishFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        wellDone: {
            type: Type.STRING,
            description: "Positive feedback on what the student did well in their response. Be encouraging."
        },
        toImprove: {
            type: Type.STRING,
            description: "Constructive feedback on how to improve the response to achieve an 'Excellence' grade. Provide specific, actionable advice on structure, evidence, and analysis."
        }
    },
    required: ["wellDone", "toImprove"]
};

export async function getEnglishFeedback(question: string, answer: string, topic: Topic): Promise<Feedback> {
  const model = 'gemini-2.5-pro';
  let prompt = '';

  if (topic.id === 'unfamiliar-text') {
     prompt = `As an expert NCEA Level 1 English examiner in New Zealand, analyze the following student response to an unfamiliar text question.
    The student was given a text and a question.
    Full Context (Text and Question): "${question}"
    Student's Answer: "${answer}"
    
    Provide feedback to help the student achieve an 'Excellence' grade. Your feedback should focus on the quality of analysis, use of evidence from the text provided in the question, and understanding of language features. Your feedback should be structured and easy for a year-11 student to understand. Keep your tone supportive and constructive.`;
  } else {
     prompt = `As an expert NCEA Level 1 English examiner in New Zealand, analyze the following student response.
    Familiar Text: 'Of Mice and Men' by John Steinbeck.
    Question: "${question}"
    Student's Answer: "${answer}"
    
    Provide feedback to help the student achieve an 'Excellence' grade. Your feedback should be structured and easy for a year-11 student to understand. Keep your tone supportive and constructive.`;
  }


  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: englishFeedbackSchema,
      temperature: 0.5,
    }
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as Feedback;
}

const mathFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        isCorrect: {
            type: Type.BOOLEAN,
            description: "Whether the student's answer is mathematically correct."
        },
        explanation: {
            type: Type.STRING,
            description: "A step-by-step explanation of how to arrive at the correct answer. If the student was incorrect, explain their likely mistake."
        }
    },
    required: ["isCorrect", "explanation"]
};


export async function getMathFeedback(question: string, answer: string): Promise<MathFeedback> {
    const model = 'gemini-2.5-flash-lite';
    const prompt = `As an NCEA Level 1 Mathematics tutor, evaluate the student's answer to the following question.
    Question: "${question}"
    Student's Answer: "${answer}"
    
    Determine if the answer is correct and provide a clear, step-by-step explanation for the solution. If the student's answer is wrong, gently point out the likely error.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: mathFeedbackSchema,
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as MathFeedback;
}


export async function getMathHint(question: string): Promise<string> {
  const model = 'gemini-2.5-flash-lite';
  const prompt = `A student is stuck on this NCEA Level 1 Mathematics problem: "${question}". Provide one single, meaningful hint to guide them toward the solution without giving away the final answer. The hint should prompt their thinking about the first or next logical step.`;
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });
  
  return response.text;
}

export async function getEnglishHint(question: string, topic: Topic): Promise<string> {
  const model = 'gemini-2.5-flash-lite';
  let promptContext = '';
  if (topic.id === 'unfamiliar-text') {
    promptContext = "This question is about analyzing an unfamiliar text. The hint should direct them to look for a specific language feature or consider the author's purpose without revealing the analysis.";
  } else {
    promptContext = `The question is about the novel 'Of Mice and Men' focusing on ${topic.name}. The hint should prompt their thinking about key themes, characters, or literary devices they should consider in their analysis.`;
  }
  
  const prompt = `A student is stuck on this NCEA Level 1 English problem: "${question}". ${promptContext} Provide one single, meaningful hint to guide them toward the solution without giving away the final answer.`;
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });
  
  return response.text;
}


const sessionSummarySchema = {
    type: Type.OBJECT,
    properties: {
        proficiency: {
            type: Type.NUMBER,
            description: "A score from 0.0 (no understanding) to 1.0 (mastery) representing the student's overall performance in this session."
        },
        areasForImprovement: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of up to 3 specific skills or concepts the student struggled with during the session. For example, 'Correctly applying Pythagoras theorem' or 'Analyzing author's purpose'."
        }
    },
    required: ["proficiency", "areasForImprovement"]
};

export async function summarizeSessionPerformance(sessionData: SessionData[], subject: Subject): Promise<{ proficiency: number; areasForImprovement: string[] }> {
    const model = 'gemini-2.5-pro';
    
    const prompt = `As an expert NCEA Level 1 ${subject} tutor, analyze the following completed learning session. The session consists of questions, the student's answers, and the feedback they received.
    Based on all the data, provide a holistic evaluation of the student's performance.
    1.  Calculate a single 'proficiency' score from 0.0 (no understanding) to 1.0 (complete mastery). For Math, base this heavily on correctness. For English, base it on the quality of analysis and detail shown in the answers, even if the feedback was constructive.
    2.  Identify up to 3 specific, concise 'areasForImprovement'. These should be actionable skills (e.g., 'Using textual evidence to support claims', 'Simplifying algebraic fractions').

    Session Data:
    ${JSON.stringify(sessionData, null, 2)}
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: sessionSummarySchema,
        }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
}