// services/geminiService.ts

// FIX: Add Chat to imports for using the chat API.
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { ChatMessage, PatternAnalysisResult, CampaignAnalysisResult, FacebookAnalysisMetrics, TikTokAnalysisMetrics, AmazonAnalysisMetrics, SnapchatAnalysisMetrics, YouTubeAnalysisMetrics, ComparisonAnalysisResult, InstagramAnalysisMetrics, GoogleAnalysisMetrics } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("لم يتم تعيين متغير البيئة API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const analysisCategorySchema = {
    type: Type.OBJECT,
    properties: {
        score: {
            type: Type.NUMBER,
            description: "درجة من 1 إلى 10 للفئة.",
        },
        analysis: {
            type: Type.STRING,
            description: "تحليل نصي مفصل للفئة على شكل نقاط واضحة وموجزة.",
        },
    },
    required: ["score", "analysis"],
};

const baseAnalysisSchemaProperties = {
    mistakes: {
      type: Type.STRING,
      description: "تحديد الأخطاء المحتملة أو نقاط الضعف في الإعلان، على شكل نقاط.",
    },
    adType: {
        type: Type.STRING,
        description: "تحليل وتحديد نوع الإعلان (مثال: شهادة عميل، فتح صندوق، تعليمي, قصة علامة تجارية).",
    },
    adGoal: {
        type: Type.STRING,
        description: "تحليل وتحديد الهدف الأساسي الذي يبدو أن الإعلان يسعى لتحقيقه (مثال: وعي بالعلامة التجارية، جذب عملاء محتملين، مبيعات مباشرة).",
    },
    recommendations: {
        type: Type.STRING,
        description: "قائمة توصيات واضحة وقابلة للتنفيذ لتحسين الإعلان، على شكل نقاط.",
    },
};

const baseAnalysisRequiredFields = ["mistakes", "adType", "adGoal", "recommendations"];


const facebookAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        silentViewingClarity: analysisCategorySchema,
        threeSecondHook: analysisCategorySchema,
        mobileFirstDesign: analysisCategorySchema,
        brandProminence: analysisCategorySchema,
        ctaClarity: analysisCategorySchema,
        feedAdAdaptation: analysisCategorySchema,
        ...baseAnalysisSchemaProperties,
    },
    required: [
        "silentViewingClarity", "threeSecondHook", "mobileFirstDesign", 
        "brandProminence", "ctaClarity", "feedAdAdaptation",
        ...baseAnalysisRequiredFields
    ],
};

export const analyzeFacebookVideo = async (frames: string[], audioBase64: string, objective: string, audience: string, adType: string, adFormat: string, width: number, height: number): Promise<FacebookAnalysisMetrics> => {
  const prompt = `
أنت **خبير استراتيجي عالمي معتمد من Meta Blueprint** في إعلانات فيسبوك وانستغرام. مهمتك هي تقديم استشارة متخصصة للغاية لعميل يريد النجاح **حصرياً** على منصات Meta. **تجاهل تماماً أفضل الممارسات للمنصات الأخرى (مثل YouTube أو TikTok).** كل نقطة تحليل يجب أن تكون من منظور مستخدم يتصفح خلاصة (Feed) مزدحمة على هاتفه.

**1. سياق المستخدم:**
- هدف الحملة المعلن: ${objective}
- الجمهور المستهدف: ${audience}
- نوع الإعلان (الأسلوب): ${adType}
- صيغة الإعلان (الموضع): ${adFormat}
- **أبعاد الفيديو:** ${width}px عرض × ${height}px ارتفاع.

**2. مهمتك التحليلية (الأهم):**
قدم تحليلاً نقدياً وعميقاً **للمعايير المحددة التالية فقط**. **يجب أن يكون كل تحليل وتوصية مرتبطين بشكل مباشر بمدى نجاح الإعلان على فيسبوك وانستغرام**. فكر في سلوك المستخدم: التمرير السريع، المشاهدة الصامتة، الانتباه القصير.

**ملاحظة هامة: لجميع التحليلات النصية، قدم الإجابة على شكل نقاط موجزة وواضحة (bullet points) باستخدام "-" لكل نقطة.**

**المعايير المطلوب تحليلها (مع التركيز الشديد على سياق Meta):**

1.  **تصميم الجوال أولاً (mobileFirstDesign)**: (درجة من 10) **هذا معيار حاسم.** الأبعاد المثالية هي 9:16 (لـ Stories/Reels) أو 4:5 (لـ Feed). بناءً على الأبعاد المقدمة (${width}x${height}), هل الفيديو مصمم بشكل أساسي للعرض العمودي؟ **إذا كان الفيديو أفقيًا (width > height)، فيجب أن تكون الدرجة منخفضة جدًا ويجب أن تشرح أن هذا يقلل من المساحة على الشاشة.** هل النصوص والعناصر الأساسية كبيرة وواضحة بما يكفي على شاشة هاتف صغيرة؟
2.  **وضوح العرض الصامت (silentViewingClarity)**: (درجة من 10) **هذا هو أهم عامل على الإطلاق.** هل يمكن فهم القصة والقيمة بالكامل بدون أي صوت؟ هل النصوص على الشاشة كافية وواضحة؟
3.  **خطاف الثلاث ثواني (threeSecondHook)**: (درجة من 10) هل المشاهد الأولى (أول 3 ثوانٍ) توقف التمرير بشكل فوري؟ هل هي جذابة بصرياً، صادمة، أو تطرح سؤالاً مثيراً للفضول؟
4.  **بروز العلامة التجارية (brandProminence)**: (درجة من 10) هل تظهر العلامة التجارية أو المنتج بوضوح في الثواني الأولى؟ هل يمكن للمستخدم معرفة من هو المعلن بسرعة؟
5.  **وضوح الدعوة للإجراء (ctaClarity)**: (درجة من 10) هل الدعوة لاتخاذ إجراء (CTA) واضحة بصرياً ومباشرة؟ هل هي موجودة لفترة كافية ليقرأها المستخدم أثناء المشاهدة الصامتة؟
6.  **التوافق مع إعلانات الخلاصة (feedAdAdaptation)**: (درجة من 10) هل يبرز الإعلان في خلاصة (Feed) مزدحمة بصرياً؟ هل يستخدم ألواناً متباينة وحركة لجذب الانتباه بين المنشورات الأخرى؟
7.  **الأخطاء ونقاط الضعف (mistakes)**: (بدون درجة) تحديد أي أخطاء تتعارض مع قواعد Meta الإعلانية أو أفضل الممارسات.
8.  **نوع الإعلان (adType)**: (بدون درجة) تأكيد نوع الإعلان بناءً على ${adType}.
9.  **هدف الإعلان (adGoal)**: (بدون درجة) استنتج الهدف الأكثر احتمالاً للإعلان.
10. **تحسينات وتوصيات (recommendations)**: (بدون درجة) قدم توصيات محددة لتحسين هذا الإعلان **للتفوق على منصة فيسبوك**.

قدم تحليلك في صيغة JSON فقط، بدون أي تنسيق markdown.
`;

    const imageParts = frames.map((frame) => ({
      inlineData: { mimeType: "image/jpeg", data: frame },
    }));

    const audioPart = {
      inlineData: { mimeType: 'audio/wav', data: audioBase64 },
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: { parts: [{ text: prompt }, ...imageParts, audioPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: facebookAnalysisSchema,
        },
      });

      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as FacebookAnalysisMetrics;
    } catch (error) {
      console.error("خطأ في تحليل فيديو فيسبوك باستخدام Gemini:", error);
      if (error instanceof Error) {
          throw new Error(`فشل تحليل فيديو فيسبوك: ${error.message}`);
      }
      throw new Error("حدث خطأ غير معروف أثناء تحليل فيديو فيسبوك.");
    }
};

const instagramAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        verticalFormatAndImmersiveness: analysisCategorySchema,
        firstTwoSecondHook: analysisCategorySchema,
        soundStrategyEffectiveness: analysisCategorySchema,
        authenticityAndNativeFeel: analysisCategorySchema,
        interactiveElementsUsage: analysisCategorySchema,
        ctaEffectiveness: analysisCategorySchema,
        ...baseAnalysisSchemaProperties,
    },
    required: [
        "verticalFormatAndImmersiveness", "firstTwoSecondHook", "soundStrategyEffectiveness",
        "authenticityAndNativeFeel", "interactiveElementsUsage", "ctaEffectiveness",
        ...baseAnalysisRequiredFields
    ],
};

export const analyzeInstagramVideo = async (frames: string[], audioBase64: string, objective: string, adFormat: string, width: number, height: number): Promise<InstagramAnalysisMetrics> => {
  const prompt = `
أنت **خبير استراتيجي مبدع متخصص في إعلانات انستغرام (Reels & Stories)**. مهمتك هي تحليل هذا الفيديو بعقلية مستخدم انستغرام الذي يتصفح المحتوى بسرعة ويبحث عن الأصالة والإبداع. **الهدف هو أن يبدو الإعلان كمحتوى أصلي وجذاب، وليس كإعلان تقليدي.**

**1. سياق المستخدم:**
- هدف الحملة المعلن: ${objective}
- صيغة الإعلان (الموضع): ${adFormat}
- **أبعاد الفيديو:** ${width}px عرض × ${height}px ارتفاع.

**2. مهمتك التحليلية (الأهم):**
قدم تحليلاً نقدياً وعميقاً **للمعايير المحددة التالية فقط**. **يجب أن يكون كل تحليل وتوصية مرتبطين بشكل مباشر بمدى نجاح الإعلان في بيئة انستغرام البصرية والسريعة**.

**ملاحظة هامة: لجميع التحليلات النصية، قدم الإجابة على شكل نقاط موجزة وواضحة (bullet points) باستخدام "-" لكل نقطة.**

**المعايير المطلوب تحليلها (مع التركيز الشديد على سياق انستغرام):**

1.  **التنسيق العمودي الغامر (verticalFormatAndImmersiveness)**: (درجة من 10) **هذا هو المعيار الأهم.** الأبعاد المثالية هي 9:16. بناءً على الأبعاد المقدمة (${width}x${height}), هل يملأ الفيديو الشاشة بالكامل ليخلق تجربة غامرة؟ **إذا كان الفيديو مربعًا أو أفقيًا، يجب أن تكون الدرجة منخفضة جدًا (1-3) مع شرح أن هذا يكسر تجربة المستخدم على Reels و Stories.**
2.  **خطاف أول ثانيتين (firstTwoSecondHook)**: (درجة من 10) انستغرام أسرع من فيسبوك. هل أول 1-2 ثانية تحتوي على حركة سريعة، لقطة غير متوقعة، أو سؤال مباشر يجذب الانتباه فوراً؟
3.  **فعالية استراتيجية الصوت (soundStrategyEffectiveness)**: (درجة من 10) هل الصوت (موسيقى رائجة، تعليق صوتي، مؤثرات) يعزز التجربة ويجعلها أكثر جاذبية؟ في نفس الوقت، هل يمكن فهم الرسالة الأساسية بدون صوت (مهم للقصص التي قد تُرى صامتة)؟
4.  **الأصالة والشعور الأصلي (authenticityAndNativeFeel)**: (درجة من 10) هل يبدو الإعلان كأنه مصور بالهاتف (UGC)، عفوي، ويستخدم أسلوب صناع المحتوى على انستغرام؟ أم أنه مصقول بشكل مبالغ فيه ويبدو كإعلان تلفزيوني؟
5.  **استخدام العناصر التفاعلية (interactiveElementsUsage)**: (درجة من 10) هل يستخدم الإعلان بصريًا ما يوحي بوجود عناصر تفاعلية مثل ملصقات الاستطلاع (Polls)، الأسئلة، أو الاختبارات لزيادة تفاعل المستخدم؟ هل هناك دعوة للمشاركة في التعليقات؟
6.  **فعالية الدعوة للإجراء (ctaEffectiveness)**: (درجة من 10) هل الدعوة لاتخاذ إجراء (CTA) واضحة ومناسبة للصيغة؟ (مثال: "اسحب لأعلى" في القصص، "تسوق الآن" مع عرض المنتجات في الريلز).
7.  **الأخطاء ونقاط الضعف (mistakes)**: (بدون درجة) تحديد أي شيء يجعل الإعلان يبدو بطيئاً، غير أصلي، أو غير مناسب لثقافة انستغرام البصرية.
8.  **نوع الإعلان (adType)**: (بدون درجة) حدد أسلوب الإعلان (UGC، عرض سريع، تعليمي، وراء الكواليس).
9.  **هدف الإعلان (adGoal)**: (بدون درجة) استنتج الهدف الأكثر احتمالاً للإعلان.
10. **تحسينات وتوصيات (recommendations)**: (بدون درجة) قدم توصيات محددة لجعل هذا الإعلان أكثر جاذبية وأصالة **لتحقيق النجاح على انستغرام**.

قدم تحليلك في صيغة JSON فقط، بدون أي تنسيق markdown.
`;

    const imageParts = frames.map((frame) => ({
      inlineData: { mimeType: "image/jpeg", data: frame },
    }));

    const audioPart = {
      inlineData: { mimeType: 'audio/wav', data: audioBase64 },
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: { parts: [{ text: prompt }, ...imageParts, audioPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: instagramAnalysisSchema,
        },
      });

      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as InstagramAnalysisMetrics;
    } catch (error) {
      console.error("خطأ في تحليل فيديو انستغرام باستخدام Gemini:", error);
      if (error instanceof Error) {
          throw new Error(`فشل تحليل فيديو انستغرام: ${error.message}`);
      }
      throw new Error("حدث خطأ غير معروف أثناء تحليل فيديو انستغرام.");
    }
};

const tiktokAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        ugcAuthenticity: analysisCategorySchema,
        trendingSoundEffectiveness: analysisCategorySchema,
        firstSecondImpact: analysisCategorySchema,
        nativeTextOverlay: analysisCategorySchema,
        viralityPotential: analysisCategorySchema,
        platformNativeFeel: analysisCategorySchema,
        ...baseAnalysisSchemaProperties,
    },
    required: [
        "ugcAuthenticity", "trendingSoundEffectiveness", "firstSecondImpact",
        "nativeTextOverlay", "viralityPotential", "platformNativeFeel",
        ...baseAnalysisRequiredFields
    ],
};

export const analyzeTikTokVideo = async (frames: string[], audioBase64: string, objective: string, audience: string, videoStyle: string, trendingSoundUsage: string, width: number, height: number): Promise<TikTokAnalysisMetrics> => {
  const prompt = `
أنت **خبير عالمي في إعلانات تيك توك وصانع محتوى فيروسي**. مهمتك هي تقييم الفيديو بعيون مستخدم تيك توك ناقد للغاية. **الفلسفة الأساسية هي: "Don't make ads, make TikToks".** هل يبدو هذا الفيديو كـ "إعلان" أم كـ "تيك توك" أصلي؟ هذا هو السؤال الأهم. تجاهل تماماً أفضل الممارسات للمنصات الأخرى.

**1. سياق المستخدم:**
- هدف الحملة المعلن: ${objective}
- الجمهور المستهدف: ${audience}
- أسلوب الفيديو: ${videoStyle}
- استخدام صوت رائج (Trending Sound): ${trendingSoundUsage}
- **أبعاد الفيديو:** ${width}px عرض × ${height}px ارتفاع.

**2. مهمتك التحليلية (الأهم):**
بناءً على **جميع** المعلومات أعلاه، قدم تحليلاً نقدياً وعميقاً **للمعايير المحددة التالية فقط**. **يجب أن يكون كل تحليل وتوصية مرتبطين بشكل مباشر بمدى نجاح الإعلان على تيك توك**.

**ملاحظة هامة: لجميع التحليلات النصية، قدم الإجابة على شكل نقاط موجزة وواضحة (bullet points) باستخدام "-" لكل نقطة.**

**المعايير المطلوب تحليلها (مع التركيز الشديد على سياق تيك توك):**

1.  **الشعور الأصلي للمنصة (platformNativeFeel)**: (درجة من 10) **هذا هو أهم معيار.** الأبعاد المثالية هي 9:16 (عمودي). بناءً على الأبعاد المقدمة (${width}x${height}), هل الفيديو عمودي؟ **إذا لم يكن كذلك (مربع أو أفقي)، يجب أن تكون الدرجة منخفضة جداً (1-3) ويجب أن تشرح أن هذا خطأ فادح للمنصة.** هل يبدو الإعلان كأنه "ينتمي" إلى صفحة "For You"، أم أنه يصرخ "أنا إعلان"؟
2.  **أصالة محتوى UGC (ugcAuthenticity)**: (درجة من 10) هل يبدو الفيديو كمحتوى أصلي مصور بالهاتف (UGC)؟ هل هو عفوي، غير مصقول بشكل مبالغ فيه؟
3.  **فعالية الصوت الرائج (trendingSoundEffectiveness)**: (درجة من 10) **هذا المعيار حاسم.** هل الصوت المستخدم هو صوت رائج حالياً على المنصة؟ هل يتزامن الصوت مع المشاهد بشكل إبداعي؟
4.  **تأثير الثانية الأولى (firstSecondImpact)**: (درجة من 10) تقييم الثانية الأولى **فقط**. هل هي صادمة، غير متوقعة، تثير الفضول فوراً، أو تبدأ في منتصف الحدث مباشرة؟
5.  **استخدام النصوص الأصلية (nativeTextOverlay)**: (درجة من 10) هل النصوص على الشاشة تستخدم أسلوب تيك توك الأصلي (الخط، الموضع، الألوان)؟
6.  **إمكانية الانتشار (viralityPotential)**: (درجة من 10) هل يحتوي الفيديو على عناصر يمكن أن تجعله فيروسياً (فكاهة، تحدي، محتوى مفيد)؟
7.  **الأخطاء ونقاط الضعف (mistakes)**: (بدون درجة) تحديد أي شيء يجعل الإعلان يبدو "إعلانياً" جداً، أو مملاً، أو بطيئاً جداً لبيئة تيك توك.
8.  **نوع الإعلان (adType)**: (بدون درجة) تأكيد أسلوب الفيديو بناءً على ${videoStyle}.
9.  **هدف الإعلان (adGoal)**: (بدون درجة) استنتج الهدف الأكثر احتمالاً.
10. **تحسينات وتوصيات (recommendations)**: (بدون درجة) قدم توصيات محددة لجعل هذا الإعلان أكثر "فيروسية" وأصالة على تيك توك.

قدم تحليلك في صيغة JSON فقط، بدون أي تنسيق markdown.
`;
    const imageParts = frames.map((frame) => ({
      inlineData: { mimeType: "image/jpeg", data: frame },
    }));

    const audioPart = {
      inlineData: { mimeType: 'audio/wav', data: audioBase64 },
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: { parts: [{ text: prompt }, ...imageParts, audioPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: tiktokAnalysisSchema,
        },
      });

      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as TikTokAnalysisMetrics;
    } catch (error) {
      console.error("خطأ في تحليل فيديو تيكتوك باستخدام Gemini:", error);
      if (error instanceof Error) {
          throw new Error(`فشل تحليل فيديو تيكتوك: ${error.message}`);
      }
      throw new Error("حدث خطأ غير معروف أثناء تحليل فيديو تيكتوك.");
    }
};

const amazonAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        platformAlignment: analysisCategorySchema,
        productShowcaseClarity: analysisCategorySchema,
        benefitOrientedCopy: analysisCategorySchema,
        conversionFocus: analysisCategorySchema,
        trustAndCredibility: analysisCategorySchema,
        directnessOfMessage: analysisCategorySchema,
        customerProblemSolution: analysisCategorySchema,
        policyCompliance: analysisCategorySchema,
        ...baseAnalysisSchemaProperties,
    },
    required: [
        "platformAlignment",
        "productShowcaseClarity", "benefitOrientedCopy", "conversionFocus",
        "trustAndCredibility", "directnessOfMessage", "customerProblemSolution",
        "policyCompliance",
        ...baseAnalysisRequiredFields
    ],
};

export const analyzeAmazonVideo = async (frames: string[], audioBase64: string, objective: string, productCategory: string, width: number, height: number): Promise<AmazonAnalysisMetrics> => {
  const prompt = `
أنت **خبير إعلانات متخصص في Amazon Advertising** وتركيزك الوحيد هو زيادة التحويلات والمبيعات. مهمتك هي تحليل هذا الفيديو بناءً على قدرته على دفع المبيعات **حصرياً** على أمازون. تجاهل تماماً أي مقاييس تتعلق بالترفيه أو الفيروسية التي لا تخدم هدف الشراء المباشر.

**1. سياق المستخدم:**
- هدف الحملة المعلن: ${objective}
- فئة المنتج: ${productCategory}
- **أبعاد الفيديو:** ${width}px عرض × ${height}px ارتفاع.

**2. مهمتك التحليلية (الأهم):**
بناءً على **جميع** المعلومات أعلاه، قدم تحليلاً نقدياً وعميقاً **للمعايير المحددة التالية فقط**. **يجب أن يكون كل تحليل وتوصية مرتبطين بشكل مباشر بمدى نجاح الإعلان في بيع المنتج على أمازون**.

**ملاحظة هامة: لجميع التحليلات النصية، قدم الإجابة على شكل نقاط موجزة وواضحة (bullet points) باستخدام "-" لكل نقطة.**

**المعايير المطلوب تحليلها (مع التركيز الشديد على التحويل والمبيعات على أمازون):**

1.  **التوافق مع المنصة (platformAlignment)**: (درجة من 10) **هذا معيار حاسم.** بناءً على الأبعاد المقدمة (${width}x${height}), هل الفيديو متوافق مع أفضل ممارسات أمازون؟ الأبعاد المثالية هي 16:9 (أفقي) لعرض المنتج بوضوح. **إذا كان الفيديو عموديًا (height > width)، فيجب أن تكون الدرجة أقل، مع شرح أن هذا قد لا يكون مثالياً لعرض المنتج على صفحات أمازون.** هل يبدو الفيديو مصممًا بشكل أساسي للبيع المباشر وعرض المنتج، أم أنه يبدو إعلانًا عامًا للعلامة التجارية غير مناسب لسياق أمازون؟
2.  **وضوح عرض المنتج (productShowcaseClarity)**: (درجة من 10) هل المنتج هو البطل المطلق للفيديو؟ هل يتم عرضه بوضوح من زوايا متعددة وهو قيد الاستخدام في الثواني الأولى؟
3.  **نص يركز على الفوائد (benefitOrientedCopy)**: (درجة من 10) هل النصوص (المنطوقة والمكتوبة) تركز بشكل مباشر على كيف يحل المنتج مشكلة العميل أو يحسن حياته، بدلاً من مجرد سرد الميزات التقنية؟
4.  **التركيز على التحويل (conversionFocus)**: (درجة من 10) هل كل عنصر في الإعلان (المشاهد، الصوت، النص) يخدم هدفاً واحداً وهو دفع المشاهد لصفحة المنتج والنقر على "أضف إلى السلة"؟ هل هناك أي مشتتات؟
5.  **الثقة والمصداقية (trustAndCredibility)**: (درجة من 10) هل جودة الإنتاج احترافية وتبني الثقة في المنتج والعلامة التجارية؟ هل هناك أي عناصر (مثل شهادات العملاء، رسوم بيانية بسيطة) تعزز المصداقية؟
6.  **مباشرة الرسالة (directnessOfMessage)**: (درجة من 10) هل الرسالة واضحة، بسيطة، ومباشرة بدون أي غموض أو إبداع مفرط؟ هل يفهم المشاهد قيمة المنتج فوراً؟
7.  **حل مشكلة العميل (customerProblemSolution)**: (درجة من 10) هل يتبع الإعلان مسار "مشكلة واضحة ومؤلمة -> المنتج كحل مثالي وسهل -> نتيجة إيجابية مرغوبة"؟
8.  **الامتثال للسياسات (policyCompliance)**: (درجة من 10) **هذا معيار حيوي.** قم بتقييم الإعلان بدقة مقابل سياسات إعلانات أمازون الصارمة. ابحث عن أي انتهاكات محتملة مثل:
    - **استخدام مراجعات العملاء:** هل يتضمن الإعلان أي شكل من أشكال مراجعات العملاء أو التقييمات بالنجوم؟ (ممنوع).
    - **الادعاءات غير المدعومة:** هل هناك ادعاءات مثل "الأفضل مبيعاً"، "رقم 1"، أو ادعاءات صحية غير مثبتة؟ (ممنوع).
    - **معلومات التسعير:** هل يذكر الإعلان أي أسعار، خصومات، أو عروض ترويجية؟ (ممنوع).
    - **الدعوة لاتخاذ إجراء خارجي:** هل يوجه الإعلان المستخدمين إلى موقع ويب خارجي أو يذكر معلومات اتصال؟ (ممنوع).
    - **استخدام علامة أمازون التجارية:** هل يتم استخدام شعار أمازون أو علاماتها التجارية بشكل غير صحيح؟ (ممنوع).
    - **محتوى غير لائق:** هل المحتوى مناسب لجميع الجماهير؟
    - **إذا تم اكتشاف أي انتهاك واضح، يجب أن تكون الدرجة منخفضة جداً (1-3) مع شرح المخالفة.**
9.  **الأخطاء ونقاط الضعف (mistakes)**: (بدون درجة) أي شيء يشتت الانتباه عن المنتج، يقلل من الثقة، أو يؤخر وصول المشاهد إلى فهم قيمة المنتج.
10. **نوع الإعلان (adType)**: (بدون درجة) حدد نوع الإعلان (عرض منتج، Unboxing، شهادة، مقارنة).
11. **هدف الإعلان (adGoal)**: (بدون درجة) يجب أن يكون الهدف الأساسي هو التحويل والمبيعات المباشرة.
12. **تحسينات وتوصيات (recommendations)**: (بدون درجة) قدم توصيات محددة لتحسين هذا الإعلان **لزيادة المبيعات بشكل مباشر على أمازون**.

قدم تحليلك في صيغة JSON فقط، بدون أي تنسيق markdown.
`;
    const imageParts = frames.map((frame) => ({
      inlineData: { mimeType: "image/jpeg", data: frame },
    }));
    const audioPart = {
      inlineData: { mimeType: 'audio/wav', data: audioBase64 },
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: { parts: [{ text: prompt }, ...imageParts, audioPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: amazonAnalysisSchema,
        },
      });
      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as AmazonAnalysisMetrics;
    } catch (error) {
      console.error("خطأ في تحليل فيديو أمازون:", error);
      throw new Error(error instanceof Error ? `فشل تحليل فيديو أمازون: ${error.message}` : "خطأ غير معروف.");
    }
};

const snapchatAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        immediateImpact: analysisCategorySchema,
        verticalVideoFormat: analysisCategorySchema,
        soundOnExperience: analysisCategorySchema,
        authenticityAndRelatability: analysisCategorySchema,
        swipeUpEffectiveness: analysisCategorySchema,
        fastPacedEditing: analysisCategorySchema,
        ...baseAnalysisSchemaProperties,
    },
    required: [
        "immediateImpact", "verticalVideoFormat", "soundOnExperience",
        "authenticityAndRelatability", "swipeUpEffectiveness", "fastPacedEditing",
        ...baseAnalysisRequiredFields
    ],
};

export const analyzeSnapchatVideo = async (frames: string[], audioBase64: string, objective: string, adFormat: string, width: number, height: number): Promise<SnapchatAnalysisMetrics> => {
  const prompt = `
أنت **خبير إعلانات متخصص في منصة سناب شات وخبير في التسويق للجيل Z**. مهمتك هي تحليل هذا الفيديو بعقلية مستخدم سناب شات الذي يتصفح بسرعة فائقة ولديه مدى انتباه قصير جداً. هل هذا المحتوى يستحق التوقف من أجله؟ **تجاهل تماماً أفضل الممارسات للمنصات البطيئة مثل فيسبوك أو يوتيوب.**

**1. سياق المستخدم:**
- هدف الحملة المعلن: ${objective}
- صيغة الإعلان: ${adFormat}
- **أبعاد الفيديو:** ${width}px عرض × ${height}px ارتفاع.

**2. مهمتك التحليلية (الأهم):**
بناءً على **جميع** المعلومات أعلاه، قدم تحليلاً نقدياً وعميقاً **للمعايير المحددة التالية فقط**. **يجب أن يكون كل تحليل وتوصية مرتبطين بشكل مباشر بمدى نجاح الإعلان على سناب شات**.

**ملاحظة هامة: لجميع التحليلات النصية، قدم الإجابة على شكل نقاط موجزة وواضحة (bullet points) باستخدام "-" لكل نقطة.**

**المعايير المطلوب تحليلها (مع التركيز الشديد على سياق سناب شات):**

1.  **صيغة الفيديو العمودي (verticalVideoFormat)**: (درجة من 10) **هذا معيار حاسم للغاية.** نسبة العرض إلى الارتفاع المثالية لسناب شات هي 9:16 (عمودي بالكامل). بناءً على الأبعاد المقدمة (${width}x${height}), هل الفيديو عمودي تمامًا؟ **إذا كان الفيديو مربعًا (تقريبًا ${height}x${height}) أو أفقيًا (${width} > ${height}), يجب أن تكون الدرجة منخفضة جدًا (1-3) ويجب أن تشرح بوضوح أن هذا خطأ فادح لأنه لا يملأ الشاشة ويبدو غير أصلي.** هل يستغل المساحة العمودية بفعالية؟
2.  **التأثير الفوري (immediateImpact)**: (درجة من 10) هل الثواني 1-2 الأولى صادمة بصرياً، أو مضحكة، أو غريبة، وتجبر على التوقف فوراً؟ لا وقت للمقدمات.
3.  **تجربة الصوت (soundOnExperience)**: (درجة من 10) على عكس فيسبوك، الصوت مهم جداً هنا. هل الصوت ملفت للانتباه ويضيف قيمة فورية؟ هل هو ممتع أو مفاجئ؟
4.  **الأصالة والارتباط (authenticityAndRelatability)**: (درجة من 10) هل يبدو الإعلان كمحتوى أصلي مصور بكاميرا الهاتف من صديق أو صانع محتوى على سناب شات؟ هل هو خام وغير مصقول؟
5.  **فعالية السحب لأعلى (swipeUpEffectiveness)**: (درجة من 10) هل هناك دعوة واضحة ومبكرة ومقنعة للسحب لأعلى (Swipe Up)؟ هل تظهر في وقت مناسب؟
6.  **المونتاج السريع (fastPacedEditing)**: (درجة من 10) هل المونتاج سريع جداً، مليء بالقطعات السريعة والانتقالات المفاجئة للحفاظ على الانتباه ومنع الملل؟
7.  **الأخطاء ونقاط الضعف (mistakes)**: (بدون درجة) أي شيء يجعل الإعلان يبدو بطيئاً، أو مصقولاً بشكل مبالغ فيه، أو غير أصلي لبيئة سناب شات.
8.  **نوع الإعلان (adType)**: (بدون درجة) حدد أسلوب الإعلان (UGC، عرض سريع، استخدام عدسة AR).
9.  **هدف الإعلان (adGoal)**: (بدون درجة) استنتج الهدف الأكثر احتمالاً.
10. **تحسينات وتوصيات (recommendations)**: (بدون درجة) قدم توصيات محددة لجعل هذا الإعلان أكثر فعالية **وسرعة وجاذبية على سناب شات**.

قدم تحليلك في صيغة JSON فقط، بدون أي تنسيق markdown.
`;
    const imageParts = frames.map((frame) => ({
      inlineData: { mimeType: "image/jpeg", data: frame },
    }));
    const audioPart = {
      inlineData: { mimeType: 'audio/wav', data: audioBase64 },
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: { parts: [{ text: prompt }, ...imageParts, audioPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: snapchatAnalysisSchema,
        },
      });
      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as SnapchatAnalysisMetrics;
    } catch (error) {
      console.error("خطأ في تحليل فيديو سنابشات:", error);
      throw new Error(error instanceof Error ? `فشل تحليل فيديو سنابشات: ${error.message}` : "خطأ غير معروف.");
    }
};

const youtubeAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        fiveSecondHook: analysisCategorySchema,
        valuePropositionClarity: analysisCategorySchema,
        pacingAndEngagement: analysisCategorySchema,
        audioVisualQuality: analysisCategorySchema,
        brandIntegrationEffectiveness: analysisCategorySchema,
        ctaStrength: analysisCategorySchema,
        ...baseAnalysisSchemaProperties,
    },
    required: [
        "fiveSecondHook", "valuePropositionClarity", "pacingAndEngagement",
        "audioVisualQuality", "brandIntegrationEffectiveness", "ctaStrength",
        ...baseAnalysisRequiredFields
    ],
};

export const analyzeYouTubeVideo = async (frames: string[], audioBase64: string, objective: string, adFormat: string, width: number, height: number): Promise<YouTubeAnalysisMetrics> => {
  const prompt = `
أنت **خبير استراتيجي متخصص في إعلانات يوتيوب**، ولديك خبرة عميقة في إنشاء إعلانات قابلة للتخطي (Skippable In-Stream Ads) تحقق أقصى أداء. مهمتك هي تحليل هذا الفيديو من منظور مستخدم يوتيوب الذي يرى الإعلان قبل الفيديو الذي يريد مشاهدته، وهو مستعد للنقر على "تخطي الإعلان" في أي لحظة.

**1. سياق المستخدم:**
- هدف الحملة المعلن: ${objective}
- صيغة الإعلان: ${adFormat}
- **أبعاد الفيديو:** ${width}px عرض × ${height}px ارتفاع.

**2. مهمتك التحليلية (الأهم):**
بناءً على **جميع** المعلومات أعلاه، قدم تحليلاً نقدياً وعميقاً **للمعايير المحددة التالية فقط**. **يجب أن يكون كل تحليل وتوصية مرتبطين بشكل مباشر بمدى نجاح الإعلان في بيئة يوتيوب التنافسية**.

**ملاحظة هامة: لجميع التحليلات النصية، قدم الإجابة على شكل نقاط موجزة وواضحة (bullet points) باستخدام "-" لكل نقطة.**

**المعايير المطلوب تحليلها (مع التركيز الشديد على سياق يوتيوب):**

1.  **خطاف الخمس ثواني الأولى (fiveSecondHook)**: (درجة من 10) **هذا هو المعيار الأكثر أهمية على الإطلاق.** هل الثواني الخمس الأولى تجذب الانتباه بقوة وتجعل المشاهد يتردد في تخطي الإعلان؟ هل هي سريعة الإيقاع، مثيرة للفضول، أو تقدم قيمة فورية؟
2.  **وضوح القيمة المقدمة (valuePropositionClarity)**: (درجة من 10) هل يفهم المشاهد بسرعة (خلال 5-10 ثوانٍ) ما هو المنتج أو الخدمة وما هي الفائدة التي سيحصل عليها؟
3.  **الإيقاع والتفاعل (pacingAndEngagement)**: (درجة من 10) بعد الثواني الخمس الأولى، هل يحافظ الإعلان على اهتمام المشاهد من خلال التغييرات في المشاهد، أو سرد القصص، أو الإيقاع السريع؟ أم أنه يصبح مملاً؟
4.  **جودة الصوت والصورة (audioVisualQuality)**: (درجة من 10) يوتيوب منصة عالية الجودة. هل جودة الفيديو والصوت احترافية؟ هل الصورة واضحة والصوت نقي؟ **إذا كان الفيديو عموديًا (${height} > ${width}) في صيغة إعلان أفقي، يجب أن تكون الدرجة أقل مع شرح أن هذا يقلل من تجربة المشاهدة.**
5.  **فعالية دمج العلامة التجارية (brandIntegrationEffectiveness)**: (درجة من 10) هل يتم دمج العلامة التجارية (شعار، منتج) بشكل طبيعي وفعال في الثواني الخمس الأولى وفي جميع أنحاء الفيديو؟
6.  **قوة الدعوة للإجراء (ctaStrength)**: (درجة من 10) هل الدعوة لاتخاذ إجراء (CTA) واضحة، مقنعة، وتخبر المشاهد بما يجب عليه فعله بالضبط؟ هل هي مدعومة بعناصر مرئية وصوتية؟
7.  **الأخطاء ونقاط الضعف (mistakes)**: (بدون درجة) تحديد أي شيء قد يدفع المشاهد إلى تخطي الإعلان فوراً، مثل المقدمات البطيئة، أو جودة الإنتاج الرديئة، أو الرسائل غير الواضحة.
8.  **نوع الإعلان (adType)**: (بدون درجة) حدد أسلوب الإعلان (عرض منتج، قصة، شهادة عميل).
9.  **هدف الإعلان (adGoal)**: (بدون درجة) استنتج الهدف الأكثر احتمالاً للإعلان.
10. **تحسينات وتوصيات (recommendations)**: (بدون درجة) قدم توصيات محددة لتحسين هذا الإعلان **لتحقيق أقصى استفادة من ميزانية إعلانات يوتيوب**.

قدم تحليلك في صيغة JSON فقط، بدون أي تنسيق markdown.
`;
    const imageParts = frames.map((frame) => ({
      inlineData: { mimeType: "image/jpeg", data: frame },
    }));
    const audioPart = {
      inlineData: { mimeType: 'audio/wav', data: audioBase64 },
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: { parts: [{ text: prompt }, ...imageParts, audioPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: youtubeAnalysisSchema,
        },
      });
      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as YouTubeAnalysisMetrics;
    } catch (error) {
      console.error("خطأ في تحليل فيديو يوتيوب:", error);
      throw new Error(error instanceof Error ? `فشل تحليل فيديو يوتيوب: ${error.message}` : "خطأ غير معروف.");
    }
};

// @FIX: Add analyzeGoogleVideo function
const googleAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        formatSuitability: analysisCategorySchema,
        hookAndBranding: analysisCategorySchema,
        visualStorytelling: analysisCategorySchema,
        pacingAndStructure: analysisCategorySchema,
        ctaStrengthAndPlacement: analysisCategorySchema,
        audienceResonance: analysisCategorySchema,
        ...baseAnalysisSchemaProperties,
    },
    required: [
        "formatSuitability", "hookAndBranding", "visualStorytelling",
        "pacingAndStructure", "ctaStrengthAndPlacement", "audienceResonance",
        ...baseAnalysisRequiredFields
    ],
};

export const analyzeGoogleVideo = async (frames: string[], audioBase64: string, objective: string, adNetwork: string, width: number, height: number): Promise<GoogleAnalysisMetrics> => {
  const prompt = `
أنت **خبير استراتيجي معتمد في إعلانات جوجل للفيديو (Google Ads Video)**، وخبير في مبادئ ABCD الإعلانية من جوجل (Attract, Brand, Connect, Direct). مهمتك هي تحليل هذا الفيديو الإعلاني لتقييم فعاليته على شبكات جوجل للفيديو (يوتيوب وشركاء الفيديو).

**1. سياق المستخدم:**
- هدف الحملة المعلن: ${objective}
- شبكة الإعلان: ${adNetwork}
- **أبعاد الفيديو:** ${width}px عرض × ${height}px ارتفاع.

**2. مهمتك التحليلية (الأهم):**
بناءً على **جميع** المعلومات أعلاه، قدم تحليلاً نقدياً وعميقاً **للمعايير المحددة التالية فقط**، مع ربط كل معيار بمبادئ ABCD من جوجل حيثما أمكن.

**ملاحظة هامة: لجميع التحليلات النصية، قدم الإجابة على شكل نقاط موجزة وواضحة (bullet points) باستخدام "-" لكل نقطة.**

**المعايير المطلوب تحليلها (مع التركيز الشديد على سياق إعلانات جوجل):**

1.  **الجذب والعلامة التجارية (أول 5 ثوانٍ) (hookAndBranding - Attract & Brand)**: (درجة من 10) هل الثواني الأولى تجذب الانتباه بقوة؟ هل يتم تقديم العلامة التجارية بشكل واضح (بصريًا أو سمعيًا) خلال هذه الفترة الحرجة؟
2.  **التواصل وسرد القصص (visualStorytelling - Connect)**: (درجة من 10) هل يروي الإعلان قصة أو يثير مشاعر لدى المشاهد؟ هل يستخدم الإيقاع والصوت لخلق اتصال عاطفي أو فكري؟
3.  **قوة وموضع الدعوة للإجراء (ctaStrengthAndPlacement - Direct)**: (درجة من 10) هل هناك دعوة واضحة ومقنعة لاتخاذ إجراء؟ هل تظهر في الوقت المناسب وهل هي معززة بصريًا (نصوص، رسومات)؟
4.  **رنين الجمهور (audienceResonance)**: (درجة من 10) هل يبدو أن الرسالة، الأسلوب، والمحتوى مصممون خصيصًا للتحدث إلى جمهور معين؟ هل هو ملائم لسياق المشاهدة على يوتيوب؟
5.  **الإيقاع والبنية (pacingAndStructure)**: (درجة من 10) هل إيقاع الفيديو مناسب؟ (سريع للمشاهد القصيرة، أو أبطأ للقصص الأطول). هل البنية السردية واضحة ومنطقية؟
6.  **ملائمة الصيغة (formatSuitability)**: (درجة من 10) بناءً على طول الفيديو وأسلوبه، هل هو مناسب للصيغ المختلفة مثل (In-Stream قابل للتخطي، Bumper Ad، In-Feed)؟ هل الأبعاد (${width}x${height}) مناسبة؟
7.  **الأخطاء ونقاط الضعف (mistakes)**: (بدون درجة) تحديد أي شيء يتعارض مع أفضل ممارسات إعلانات جوجل للفيديو، مثل المقدمات البطيئة أو الرسائل المعقدة.
8.  **نوع الإعلان (adType)**: (بدون درجة) حدد أسلوب الإعلان (عرض منتج، قصة علامة تجارية، تعليمي).
9.  **هدف الإعلان (adGoal)**: (بدون درجة) استنتج الهدف الأكثر احتمالاً (وعي، اهتمام، تحويل).
10. **تحسينات وتوصيات (recommendations)**: (بدون درجة) قدم توصيات محددة لتحسين هذا الإعلان **لتحقيق أداء أفضل على شبكة جوجل للفيديو**.

قدم تحليلك في صيغة JSON فقط، بدون أي تنسيق markdown.
`;
    const imageParts = frames.map((frame) => ({
      inlineData: { mimeType: "image/jpeg", data: frame },
    }));
    const audioPart = {
      inlineData: { mimeType: 'audio/wav', data: audioBase64 },
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: { parts: [{ text: prompt }, ...imageParts, audioPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: googleAnalysisSchema,
        },
      });
      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as GoogleAnalysisMetrics;
    } catch (error) {
      console.error("خطأ في تحليل فيديو جوجل:", error);
      throw new Error(error instanceof Error ? `فشل تحليل فيديو جوجل: ${error.message}` : "خطأ غير معروف.");
    }
};


const patternAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        visualPatterns: {
            type: Type.STRING,
            description: "تحليل الأنماط البصرية المشتركة في جميع الإعلانات المقدمة، مثل (سرعة المونتاج، أنواع اللقطات، استخدام النصوص، أسلوب الألوان). قدمها على شكل نقاط.",
        },
        auditoryPatterns: {
            type: Type.STRING,
            description: "تحليل الأنماط الصوتية المشتركة، مثل (نوع الموسيقى، استخدام المؤثرات الصوتية، أسلوب التعليق الصوتي). قدمها على شكل نقاط.",
        },
        messagingPatterns: {
            type: Type.STRING,
            description: "تحليل مواضيع الرسائل والأفكار التسويقية السائدة في هذه الإعلانات. قدمها على شكل نقاط.",
        },
        ctaPatterns: {
            type: Type.STRING,
            description: "تحليل الأنماط المشتركة في الدعوة لاتخاذ إجراء (CTA)، مثل (نوعها، توقيت ظهورها، صياغتها). قدمها على شكل نقاط.",
        },
        emotionalArcPatterns: {
            type: Type.STRING,
            description: "تحليل الأنماط المتكررة في الرحلة العاطفية التي يخوضها المشاهد. قدمها على شكل نقاط.",
        },
        winningFormula: {
            type: Type.STRING,
            description: "بناءً على جميع الأنماط المستخلصة، قم بصياغة 'الوصفة السحرية' أو 'الصيغة الناجحة' كملخص استنتاجي. يجب أن يكون هذا الملخص دليلاً عملياً لإنشاء إعلان ناجح جديد بناءً على هذه المجموعة من الإعلانات.",
        },
    },
    required: ["visualPatterns", "auditoryPatterns", "messagingPatterns", "ctaPatterns", "emotionalArcPatterns", "winningFormula"],
};

export const analyzePatterns = async (videos: { frames: string[], audioBase64: string }[]): Promise<PatternAnalysisResult> => {
    const prompt = `
أنت محلل بيانات وخبير استراتيجي في مجال الإعلانات الرقمية. مهمتك هي تحليل مجموعة من إعلانات الفيديو (المقدمة كسلسلة من الإطارات والمقاطع الصوتية) بهدف إيجاد "الوصفة السحرية" أو الأنماط المشتركة التي تساهم في نجاحها.

**ملاحظة هامة جداً: لجميع التحليلات النصية، قدم الإجابة على شكل نقاط موجزة وواضحة (bullet points) باستخدام "-" لكل نقطة، باستثناء "الوصفة السحرية" التي يجب أن تكون فقرة موجزة.**

**المطلوب:**
1.  **الأنماط البصرية المشتركة (visualPatterns)**: ما هي السمات البصرية المتكررة؟ (مثال: استخدام لقطات سريعة في أول 3 ثوانٍ، هيمنة الألوان الزاهية، ظهور المنتج بشكل بارز، أسلوب محتوى من إنشاء المستخدم UGC).
2.  **الأنماط الصوتية المتكررة (auditoryPatterns)**: ما هي العناصر الصوتية المشتركة؟ (مثال: استخدام موسيقى تريندينج، البدء بصمت ثم صوت مفاجئ، تعليق صوتي سريع وحماسي).
3.  **مواضيع الرسائل السائدة (messagingPatterns)**: ما هي الأفكار التسويقية الرئيسية التي تتكرر؟ (مثال: التركيز على حل مشكلة، إظهار شهادات العملاء، خلق شعور بالإلحاح).
4.  **أنماط الدعوة لاتخاذ إجراء (ctaPatterns)**: كيف يتم تقديم الـ CTA بشكل متكرر؟ (مثال: CTA نصي واضح في نهاية الفيديو، CTA صوتي، عرض خصم محدود الوقت).
5.  **أنماط القوس العاطفي (emotionalArcPatterns)**: هل هناك رحلة عاطفية مشتركة؟ (مثال: تبدأ الإعلانات بالفضول، تنتقل إلى الإثارة، وتنتهي بالرضا).
6.  **الوصفة السحرية (winningFormula)**: قدم ملخصاً استنتاجياً يجمع كل الأنماط المكتشفة في صيغة "وصفة نجاح". صف كيف يمكن لشخص ما إنشاء إعلان جديد ناجح بناءً على هذه النتائج. (مثال: "لإنشاء إعلان ناجح، ابدأ بخطاف بصري سريع ومفاجئ مع صوت تريندينج، ثم قدم المشكلة التي يحلها المنتج بوضوح، واعرض شهادات سريعة من العملاء، وأنهِ الفيديو بدعوة واضحة للشراء مع عرض خصم.").

فيما يلي بيانات الفيديوهات. كل فيديو يبدأ بـ "--- VIDEO X START ---" وينتهي بـ "--- VIDEO X END ---".

قدم تحليلك في صيغة JSON فقط، بدون أي تنسيق markdown. يجب أن تلتزم تمامًا بالـ schema المحدد.
`;

    const allParts = videos.flatMap((video, index) => {
        const videoStartText = { text: `--- VIDEO ${index + 1} START ---` };
        const imageParts = video.frames.map(frame => ({
            inlineData: { mimeType: "image/jpeg", data: frame }
        }));
        const audioPart = {
            inlineData: { mimeType: 'audio/wav', data: video.audioBase64 }
        };
        const videoEndText = { text: `--- VIDEO ${index + 1} END ---` };
        return [videoStartText, ...imageParts, audioPart, videoEndText];
    });


    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: { parts: [{ text: prompt }, ...allParts] },
            config: {
                responseMimeType: "application/json",
                responseSchema: patternAnalysisSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PatternAnalysisResult;

    } catch (error) {
        console.error("خطأ في تحليل الأنماط باستخدام Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`فشل تحليل الأنماط: ${error.message}`);
        }
        throw new Error("حدث خطأ غير معروف أثناء تحليل الأنماط.");
    }
};


const campaignAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        performanceOverview: {
            type: Type.STRING,
            description: "ملخص عام لأداء الحملة بناءً على النتائج المقدمة. هل الأداء جيد، متوسط، أم ضعيف؟ وما هو المؤشر الأبرز؟",
        },
        creativeCorrelation: {
            type: Type.STRING,
            description: "تحليل يربط بين عناصر الإبداع في الفيديو (مثل الخطاف، المشاهد، الرسالة) والنتائج الرقمية. مثال: 'قد يكون سبب انخفاض نسبة النقر إلى الظهور (CTR) هو ضعف الخطاف في الثواني الأولى'. قدمها على شكل نقاط.",
        },
        actionableRecommendations: {
            type: Type.STRING,
            description: "قائمة توصيات عملية ومحددة لتحسين الحملة القادمة بناءً على هذا التحليل. مثال: 'جرب خطافًا بصريًا أكثر إثارة'، 'قم بتبسيط الدعوة لاتخاذ إجراء'. قدمها على شكل نقاط.",
        },
        futureTestingIdeas: {
            type: Type.STRING,
            description: "اقتراح فرضيات واضحة لاختبارات A/B في المستقبل. مثال: 'اختبر نسخة من الإعلان بموسيقى مختلفة'، 'قارن بين دعوة لاتخاذ إجراء باللون الأحمر مقابل الأخضر'. قدمها على شكل نقاط.",
        },
    },
    required: ["performanceOverview", "creativeCorrelation", "actionableRecommendations", "futureTestingIdeas"],
};

export const analyzeCampaignResults = async (
    video: { frames: string[], audioBase64: string }, 
    results: { text?: string, imageBase64?: string }
): Promise<CampaignAnalysisResult> => {

    const resultsPrompt = results.text 
        ? `فيما يلي النتائج التي أدخلها المستخدم نصيًا:\n${results.text}`
        : `فيما يلي صورة للوحة تحكم النتائج التي رفعها المستخدم:`;

    const prompt = `
أنت محلل بيانات وخبير إعلانات مدفوعة (Media Buyer) محترف. مهمتك هي تحليل إعلان فيديو تم نشره بالفعل، وذلك بربط محتوى الفيديو بنتائج أدائه الرقمية.

**المدخلات:**
1.  **إعلان الفيديو:** مقدم كسلسلة من الإطارات والمقطع الصوتي.
2.  **نتائج الأداء:** مقدمة إما كنص أو كصورة للوحة تحكم.

**المهمة:**
قم بتحليل الفيديو والنتائج معًا لتقديم رؤى عميقة.

**ملاحظة هامة جداً: لجميع التحليلات النصية، قدم الإجابة على شكل نقاط موجزة وواضحة (bullet points) باستخدام "-" لكل نقطة، باستثناء "نظرة عامة على الأداء" التي يجب أن تكون فقرة موجزة.**

**التحليل المطلوب:**
1.  **نظرة عامة على الأداء (performanceOverview):** بناءً على الأرقام المقدمة، قدم ملخصًا سريعًا لأداء الإعلان. هل هو جيد؟ هل هناك مؤشرات مثيرة للقلق؟
2.  **الربط بين الإبداع والنتائج (creativeCorrelation):** هذا هو الجزء الأهم. قم بتحليل الفيديو بعمق واربط عناصره المحددة بالنتائج. أمثلة للربط:
    *   "معدل المشاهدة الكامل (VCR) مرتفع، وهذا قد يعود إلى القصة الجذابة التي بدأت في الثانية الخامسة."
    *   "نسبة النقر إلى الظهور (CTR) منخفضة، ربما لأن الدعوة لاتخاذ إجراء (CTA) في النهاية غير واضحة بصريًا."
    *   "التكلفة لكل ألف ظهور (CPM) عالية، قد يكون السبب أن المشاهد الأولى لا تجذب الجمهور المستهدف مما يقلل من نقاط الصلة."
3.  **توصيات عملية (actionableRecommendations):** بناءً على تحليلك، ما هي التغييرات المحددة التي تقترحها على الفيديو الإبداعي القادم لتحسين النتائج؟ كن دقيقًا.
4.  **أفكار لاختبارات مستقبلية (futureTestingIdeas):** اقترح 2-3 اختبارات A/B واضحة يمكن للمستخدم إجراؤها في حملته القادمة بناءً على هذا التحليل. (مثال: اختبار نسختين بخطاف مختلف، اختبار CTA مختلف، إلخ).

${resultsPrompt}

قدم تحليلك في صيغة JSON فقط، بدون أي تنسيق markdown. يجب أن تلتزم تمامًا بالـ schema المحدد.
`;
    
    const imageParts = video.frames.map(frame => ({
        inlineData: { mimeType: "image/jpeg", data: frame }
    }));
    
    const audioPart = {
        inlineData: { mimeType: 'audio/wav', data: video.audioBase64 }
    };
    
    const parts: any[] = [{ text: prompt }, ...imageParts, audioPart];
    
    if (results.imageBase64) {
        parts.push({
            inlineData: { mimeType: "image/jpeg", data: results.imageBase64 }
        });
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: campaignAnalysisSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as CampaignAnalysisResult;

    } catch (error) {
        console.error("خطأ في تحليل نتائج الحملة باستخدام Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`فشل تحليل نتائج الحملة: ${error.message}`);
        }
        throw new Error("حدث خطأ غير معروف أثناء تحليل نتائج الحملة.");
    }
};

const comparisonAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        video1Strengths: {
            type: Type.STRING,
            description: "نقاط القوة في الفيديو الأول على شكل نقاط.",
        },
        video2Strengths: {
            type: Type.STRING,
            description: "نقاط القوة في الفيديو الثاني على شكل نقاط.",
        },
        video1Weaknesses: {
            type: Type.STRING,
            description: "نقاط الضعف في الفيديو الأول على شكل نقاط.",
        },
        video2Weaknesses: {
            type: Type.STRING,
            description: "نقاط الضعف في الفيديو الثاني على شكل نقاط.",
        },
        recommendation: {
            type: Type.STRING,
            description: "توصية مفصلة تشرح أي فيديو هو الأفضل ولماذا، مع تقديم نصائح لتحسين الفيديو الأضعف.",
        },
        winner: {
            type: Type.STRING,
            description: "تحديد الفيديو الفائز ('video1' or 'video2') أو 'tie' إذا كانا متساويين.",
        },
    },
    required: ["video1Strengths", "video2Strengths", "video1Weaknesses", "video2Weaknesses", "recommendation", "winner"],
};

export const compareVideos = async (video1: { frames: string[], audioBase64: string }, video2: { frames: string[], audioBase64: string }): Promise<ComparisonAnalysisResult> => {
    const prompt = `
أنت ناقد إعلانات خبير ومحترف. مهمتك هي مقارنة إعلانين فيديو بشكل موضوعي وتحديد أيهما أفضل.

**المهمة:**
قم بتحليل كل فيديو على حدة ثم قارن بينهما.

**ملاحظة هامة جداً: لجميع التحليلات النصية، قدم الإجابة على شكل نقاط موجزة وواضحة (bullet points) باستخدام "-" لكل نقطة، باستثناء "التوصية" التي يجب أن تكون فقرة.**

**التحليل المطلوب:**
1.  **نقاط القوة - الفيديو 1 (video1Strengths):** ما هي أبرز مميزات الفيديو الأول؟
2.  **نقاط القوة - الفيديو 2 (video2Strengths):** ما هي أبرز مميزات الفيديو الثاني؟
3.  **نقاط الضعف - الفيديو 1 (video1Weaknesses):** ما هي أبرز عيوب الفيديو الأول؟
4.  **نقاط الضعف - الفيديو 2 (video2Weaknesses):** ما هي أبرز عيوب الفيديو الثاني؟
5.  **التوصية والفائز (recommendation & winner):** بناءً على المقارنة الشاملة، أي فيديو هو الأفضل ولماذا؟ قدم توصية واضحة. يجب أن يكون الفائز 'video1' أو 'video2' أو 'tie'.

فيما يلي بيانات الفيديوهات.

قدم تحليلك في صيغة JSON فقط، بدون أي تنسيق markdown.
`;
    const allParts = [
        { text: "--- VIDEO 1 START ---" },
        ...video1.frames.map(frame => ({ inlineData: { mimeType: "image/jpeg", data: frame } })),
        { inlineData: { mimeType: 'audio/wav', data: video1.audioBase64 } },
        { text: "--- VIDEO 1 END ---" },
        { text: "--- VIDEO 2 START ---" },
        ...video2.frames.map(frame => ({ inlineData: { mimeType: "image/jpeg", data: frame } })),
        { inlineData: { mimeType: 'audio/wav', data: video2.audioBase64 } },
        { text: "--- VIDEO 2 END ---" },
    ];

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: { parts: [{ text: prompt }, ...allParts] },
            config: {
                responseMimeType: "application/json",
                responseSchema: comparisonAnalysisSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ComparisonAnalysisResult;
    } catch (error) {
      console.error("خطأ في مقارنة الفيديوهات:", error);
      throw new Error(error instanceof Error ? `فشل مقارنة الفيديوهات: ${error.message}` : "خطأ غير معروف.");
    }
};

export const continueChat = async (analysisContext: string, chatHistory: ChatMessage[], newUserMessage: string): Promise<string> => {
    const systemInstruction = `أنت 'خبير التحليل'، مساعد ذكاء اصطناعي ودود ومتخصص في تحليل إعلانات الفيديو. هدفك هو مساعدة المستخدم على فهم تقريره بعمق. تحدث بأسلوب بشري وغير رسمي، استخدم كلمات بسيطة، وقدم أمثلة عند الضرورة. كن استباقيًا في اقتراح أفكار لتحسين إعلاناته المستقبلية بناءً على التقرير. لا تكتفِ بالإجابة فقط، بل حاول إثراء المحادثة وإظهار بعض الشخصية. هذا هو تقرير المستخدم الذي ستجيب على الأسئلة المتعلقة به: ${analysisContext}`;

    try {
        // @FIX: The `sendMessage` method expects an object with a `message` property.
        // @FIX: Refactored to use the idiomatic ai.chats.create API for conversation.
        const chat: Chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
            },
            history: chatHistory.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }],
            })),
        });

        const response = await chat.sendMessage({ message: newUserMessage });
        return response.text;
    } catch (error) {
        console.error("خطأ في دردشة Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`فشلت الدردشة: ${error.message}`);
        }
        throw new Error("حدث خطأ غير معروف أثناء الدردشة.");
    }
};
