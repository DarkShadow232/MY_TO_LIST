const GEMINI_API_KEY = 'AIzaSyBVqWLNIkZCapCtGDRot92BBI85dveDPa8';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

async function generateTasks(userInput) {
    const prompt = `
    قم بتحويل النص التالي إلى مهام قابلة للتنفيذ. قم بتقسيم المهام إلى مجموعات منطقية إذا كان ذلك مناسباً.
    يجب أن تكون المهام محددة وقابلة للتنفيذ وواضحة.
    قم بإرجاع النتيجة بتنسيق JSON على الشكل التالي:
    {
        "groups": [
            {
                "name": "اسم المجموعة",
                "tasks": ["مهمة 1", "مهمة 2", "مهمة 3"]
            }
        ]
    }
    
    النص المدخل: ${userInput}`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('فشل في الاتصال بـ Gemini API');
        }

        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;
        
        // استخراج JSON من النص المولد
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('تنسيق غير صالح من Gemini API');
    } catch (error) {
        console.error('خطأ في توليد المهام:', error);
        throw error;
    }
}
