import { StorageService } from './storageService';
import { NotificationSettings } from '../types';

export const generateSmartNotification = (settings: NotificationSettings) => {
  if (!settings.enabled) return null;

  const stats = StorageService.getStats();
  const exams = StorageService.getExams();
  const dailyGoal = StorageService.getDailyGoalMinutes();
  const languages = settings.language; // 'en' | 'hi' | 'both'

  // Categories list
  const activeCategories: string[] = [];
  if (settings.studyEnabled) activeCategories.push('study');
  if (settings.motivationEnabled) activeCategories.push('motivation');
  if (settings.streakEnabled) activeCategories.push('streak');
  if (settings.examEnabled && exams.length > 0) activeCategories.push('exam');
  if (settings.goalEnabled) activeCategories.push('goal');

  if (activeCategories.length === 0) return null;

  // Choose a random category
  const category = activeCategories[Math.floor(Math.random() * activeCategories.length)];

  // Define bilingual alerts
  if (category === 'streak') {
    const streak = stats.currentStreak || 1;
    if (languages === 'hi') {
      return {
        title: "🔥 लगातार पढ़ाई की लकीर!",
        body: `आपका ${streak} दिनों का पढ़ाई का रिकॉर्ड है! इसे आज टूटने न दें।`
      };
    } else if (languages === 'both') {
      return {
        title: "🔥 Keep Your Streak!",
        body: `Aapka study streak ${streak} days ka hai! Aaj break mat hone dena.`
      };
    } else {
      return {
        title: "🔥 Maintain Your Streak!",
        body: `You are on a ${streak}-day study streak! Do not let it break today.`
      };
    }
  }

  if (category === 'goal') {
    const mins = stats.totalMinutesStudied || 0;
    if (mins >= dailyGoal) {
      if (languages === 'hi') {
        return {
          title: "🎉 दैनिक लक्ष्य पूरा हुआ!",
          body: `बधाई हो! आपने आज का ${dailyGoal} मिनट का लक्ष्य पूरा कर लिया है।`
        };
      } else if (languages === 'both') {
        return {
          title: "🎉 Daily Goal Achieved!",
          body: `Superb! Aapne aaj ka ${dailyGoal} minutes study goal poora kar liya.`
        };
      } else {
        return {
          title: "🎉 Daily Goal Achieved!",
          body: `Congratulations! You've crushed your daily goal of ${dailyGoal} minutes.`
        };
      }
    } else {
      const remaining = Math.max(10, dailyGoal - mins);
      if (languages === 'hi') {
        return {
          title: "🎯 लक्ष्य के करीब!",
          body: `आप अपने ${dailyGoal} मिनट के दैनिक लक्ष्य से केवल ${remaining} मिनट दूर हैं।`
        };
      } else if (languages === 'both') {
        return {
          title: "🎯 Daily Goal Progress!",
          body: `Aap daily goal se sirf ${remaining} mins door hain. Let's finish it!`
        };
      } else {
        return {
          title: "🎯 Focus on Your Goal!",
          body: `You are only ${remaining} minutes away from your daily study goal of ${dailyGoal} mins.`
        };
      }
    }
  }

  if (category === 'exam' && exams.length > 0) {
    const nextExam = exams[0];
    const today = new Date();
    const examDate = new Date(nextExam.examDate);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const randomTopic = nextExam.topics[Math.floor(Math.random() * nextExam.topics.length)] || 'revision';

    if (languages === 'hi') {
      return {
        title: "⏳ परीक्षा आ रही है!",
        body: `आपकी '${nextExam.examName}' परीक्षा में केवल ${diffDays} दिन बचे हैं। आज '${randomTopic}' दोहराएं।`
      };
    } else if (languages === 'both') {
      return {
        title: "⏳ Exam is Coming!",
        body: `${nextExam.examName} me sirf ${diffDays} days bache hain! Aaj '${randomTopic}' revise kar lo.`
      };
    } else {
      return {
        title: "⏳ Exam Countdown!",
        body: `'${nextExam.examName}' is in ${diffDays} days! Take a look at '${randomTopic}' today.`
      };
    }
  }

  if (category === 'motivation') {
    // If we have custom messages, we can mix them
    if (settings.customMessages.length > 0 && Math.random() < 0.4) {
      return {
        title: "💡 Daily Spark",
        body: settings.customMessages[Math.floor(Math.random() * settings.customMessages.length)]
      };
    }

    const defaultQuotes = {
      en: [
        "Double your concentration, halve your distractions.",
        "Your future is created by what you do today, not tomorrow.",
        "Success isn't overnight. It's when every day you get a little better.",
        "The best way to predict the future is to create it."
      ],
      hi: [
        "एकाग्रता दोगुनी करें, ध्यान भटकाना आधा करें।",
        "आपका भविष्य आपके आज के कार्यों से बनता है, कल के नहीं।",
        "सफलता रातों-रात नहीं मिलती, यह हर दिन थोड़ा बेहतर होने से मिलती है।",
        "भविष्य का अनुमान लगाने का सबसे अच्छा तरीका उसे बनाना है।"
      ],
      both: [
        "Concentration double karo, distractions half karo. Let's study!",
        "Aapka future aaj ke hard work se decide hota hai, kal se nahi.",
        "Consistent mehnat hi success ki sabse badi key hai.",
        "Har din thoda thoda improve karo, result zaroor milega!"
      ]
    };

    const list = defaultQuotes[languages] || defaultQuotes.both;
    const msg = list[Math.floor(Math.random() * list.length)];
    return {
      title: languages === 'hi' ? "✨ प्रेरणादायक विचार" : "✨ Mindset Booster",
      body: msg
    };
  }

  // Default to general study reminder
  const studyPrompts = {
    en: [
      "Ready to double your focus? Open StudyTube now!",
      "A 10-minute revision session can save hours of exam stress.",
      "Time to feed your brain! Choose a verified lecture."
    ],
    hi: [
      "क्या आप एकाग्र होने के लिए तैयार हैं? स्टडीट्यूब खोलें!",
      "10 मिनट का रिवीजन परीक्षा के तनाव को कम कर सकता है।",
      "ज्ञान बढ़ाने का समय! एक सत्यापित व्याख्यान चुनें।"
    ],
    both: [
      "Concentration double karne ka time! Open StudyTube now.",
      "NCERT and CBSE syllabus videos are waiting for your revision.",
      "Chalo, ek study session start karte hain! Focus Shield active."
    ]
  };

  const list = studyPrompts[languages] || studyPrompts.both;
  const msg = list[Math.floor(Math.random() * list.length)];
  return {
    title: languages === 'hi' ? "📚 अध्ययन का समय" : "📚 Smart Study Call",
    body: msg
  };
};

export const dispatchNotification = (settings: NotificationSettings) => {
  const notif = generateSmartNotification(settings);
  if (notif) {
    window.dispatchEvent(new CustomEvent('studytube-notification', { detail: notif }));
  }
};
